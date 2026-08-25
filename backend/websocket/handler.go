package websocket

import (
	"educast/config"
	"educast/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for prototype
	},
}

func HandleWebSocket(c *gin.Context) {
	// Extract JWT token from query parameter
	tokenString := c.Query("token")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	// Parse and validate token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	userID := uint(claims["user_id"].(float64))
	role := claims["role"].(string)

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Create new client and register with hub
	client := NewClient(GlobalHub, conn, userID, role)
	GlobalHub.register <- client

	// Start client pumps in goroutines
	go client.WritePump()
	go client.ReadPump()
}

// Helper functions to be called from controllers
func BroadcastBountyCreated(bounty models.Bounty) {
	if GlobalHub != nil {
		GlobalHub.BroadcastBountyCreated(bounty)
	}
}

func BroadcastBidCreated(bid models.Bid, studentID uint) {
	if GlobalHub != nil {
		GlobalHub.BroadcastBidCreated(bid, studentID)
	}
}

func BroadcastBidAccepted(bidID uint, bountyID uint, mentorID uint, studentID uint, roomID string) {
	if GlobalHub != nil {
		GlobalHub.BroadcastBidAccepted(bidID, bountyID, mentorID, studentID, roomID)
	}
}
