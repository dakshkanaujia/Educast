package main

import (
	"educast/config"
	"educast/controllers"
	"educast/middleware"
	"educast/websocket"
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	config.ConnectDatabase()

	// Initialize WebSocket hub
	websocket.GlobalHub = websocket.NewHub()
	go websocket.GlobalHub.Run()

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public routes
	auth := router.Group("/auth")
	{
		auth.POST("/signup", controllers.Signup)
		auth.POST("/login", controllers.Login)
	}

	// WebSocket endpoint
	router.GET("/ws", websocket.HandleWebSocket)

	// Protected routes
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// Bounty routes
		bounties := api.Group("/bounties")
		{
			bounties.POST("", middleware.RequireRole("Student"), controllers.CreateBounty)
			bounties.GET("", controllers.GetBounties)
			bounties.GET("/:id", controllers.GetBountyByID)
			bounties.POST("/:id/complete", middleware.RequireRole("Student"), controllers.CompleteBounty)

			// Bid routes
			bounties.POST("/:id/bids", middleware.RequireRole("Mentor"), controllers.CreateBid)
			bounties.GET("/:id/bids", middleware.RequireRole("Student"), controllers.GetBidsForBounty)
		}

		// Accept bid route
		api.POST("/bids/:id/accept", middleware.RequireRole("Student"), controllers.AcceptBid)
		
		// My bids route for mentors
		api.GET("/my-bids", middleware.RequireRole("Mentor"), controllers.GetMyBids)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	port := config.AppConfig.ServerPort
	fmt.Printf("🚀 EduCast server starting on port %s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
