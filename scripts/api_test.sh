#!/usr/bin/env bash
# EduCast API test suite — black-box validation of the REST API.
# Requires the stack to be running (docker compose up) and python3 for JSON parsing.
# Usage: ./scripts/api_test.sh [BASE_URL]   (default http://localhost:8080)
set -u

B="${1:-http://localhost:8080}"
S=$(date +%s)
SE="stud_${S}@test.com"; ME="ment_${S}@test.com"
pass=0; fail=0

chk(){ if [ "$2" = "$3" ]; then echo "PASS | $1 | expected=$2 actual=$3"; pass=$((pass+1));
       else echo "FAIL | $1 | expected=$2 actual=$3"; fail=$((fail+1)); fi; }
code(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }
jval(){ python3 -c "import sys,json; d=json.load(sys.stdin); print(d$1)" 2>/dev/null; }

echo "===== AUTHENTICATION ====="
chk "TC-01 Signup student (201)" 201 "$(code -X POST $B/auth/signup -H 'Content-Type: application/json' -d "{\"name\":\"Stud\",\"email\":\"$SE\",\"password\":\"1234\",\"role\":\"Student\"}")"
chk "TC-02 Signup mentor (201)" 201 "$(code -X POST $B/auth/signup -H 'Content-Type: application/json' -d "{\"name\":\"Ment\",\"email\":\"$ME\",\"password\":\"1234\",\"role\":\"Mentor\"}")"
chk "TC-03 Signup duplicate email (409)" 409 "$(code -X POST $B/auth/signup -H 'Content-Type: application/json' -d "{\"name\":\"X\",\"email\":\"$SE\",\"password\":\"1234\",\"role\":\"Student\"}")"
chk "TC-04 Signup invalid email (400)" 400 "$(code -X POST $B/auth/signup -H 'Content-Type: application/json' -d '{"name":"X","email":"bad","password":"1234","role":"Student"}')"
chk "TC-05 Signup short password (400)" 400 "$(code -X POST $B/auth/signup -H 'Content-Type: application/json' -d '{"name":"X","email":"a2@b.com","password":"1","role":"Student"}')"
chk "TC-06 Signup invalid role (400)" 400 "$(code -X POST $B/auth/signup -H 'Content-Type: application/json' -d '{"name":"X","email":"c2@b.com","password":"1234","role":"Admin"}')"
chk "TC-07 Login wrong password (401)" 401 "$(code -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$SE\",\"password\":\"wrong\"}")"
STUD_TOKEN=$(curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$SE\",\"password\":\"1234\"}" | jval "['token']")
MENT_TOKEN=$(curl -s -X POST $B/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$ME\",\"password\":\"1234\"}" | jval "['token']")
chk "TC-08 Login valid returns token" yes "$([ -n "$STUD_TOKEN" ] && echo yes || echo no)"

echo "===== AUTHORIZATION / RBAC ====="
chk "TC-09 Protected route no token (401)" 401 "$(code $B/api/bounties)"
chk "TC-10 Protected route bad token (401)" 401 "$(code $B/api/bounties -H 'Authorization: Bearer garbage')"
chk "TC-11 Mentor cannot post bounty (403)" 403 "$(code -X POST $B/api/bounties -H "Authorization: Bearer $MENT_TOKEN" -H 'Content-Type: application/json' -d '{"title":"t","description":"d","budget":10}')"

echo "===== BOUNTY ====="
chk "TC-12 Create bounty missing fields (400)" 400 "$(code -X POST $B/api/bounties -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"title":"t"}')"
chk "TC-13 Create bounty budget<=0 (400)" 400 "$(code -X POST $B/api/bounties -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"title":"t","description":"d","budget":0}')"
BOUNTY_ID=$(curl -s -X POST $B/api/bounties -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"title":"Help with Calculus","description":"derivatives","subject_tag":"Math","budget":500}' | jval "['id']")
chk "TC-14 Create bounty (valid id)" yes "$([ -n "$BOUNTY_ID" ] && echo yes || echo no)"
chk "TC-15 Get bounty by id (200)" 200 "$(code $B/api/bounties/$BOUNTY_ID -H "Authorization: Bearer $STUD_TOKEN")"
chk "TC-16 Get bounty not found (404)" 404 "$(code $B/api/bounties/99999999 -H "Authorization: Bearer $STUD_TOKEN")"

echo "===== BIDDING ====="
chk "TC-17 Student cannot bid (403)" 403 "$(code -X POST $B/api/bounties/$BOUNTY_ID/bids -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"price_offer":100}')"
BIDJSON=$(curl -s -X POST $B/api/bounties/$BOUNTY_ID/bids -H "Authorization: Bearer $MENT_TOKEN" -H 'Content-Type: application/json' -d '{"price_offer":400,"note":"expert","duration_minutes":60,"preferred_time":"today 5pm"}')
BID_ID=$(echo "$BIDJSON" | jval "['id']"); MENT_ID=$(echo "$BIDJSON" | jval "['mentor_id']")
chk "TC-18 Mentor create bid (valid id)" yes "$([ -n "$BID_ID" ] && echo yes || echo no)"
chk "TC-19 Non-owner cannot view bids (403)" 403 "$(code $B/api/bounties/$BOUNTY_ID/bids -H "Authorization: Bearer $MENT_TOKEN")"
chk "TC-20 Owner views bids (200)" 200 "$(code $B/api/bounties/$BOUNTY_ID/bids -H "Authorization: Bearer $STUD_TOKEN")"

echo "===== NEGOTIATION ====="
chk "TC-21 Student counters bid (200)" 200 "$(code -X POST $B/api/bids/$BID_ID/counter -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"price":350,"note":"budget"}')"
chk "TC-22 Cannot counter own counter (400)" 400 "$(code -X POST $B/api/bids/$BID_ID/counter -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"price":300}')"
chk "TC-23 Mentor accepts counter (200)" 200 "$(code -X POST $B/api/bids/$BID_ID/counter/accept -H "Authorization: Bearer $MENT_TOKEN")"

echo "===== ACCEPTANCE / SESSION ====="
ROOM=$(curl -s -X POST $B/api/bids/$BID_ID/accept -H "Authorization: Bearer $STUD_TOKEN" | jval "['room_id']")
chk "TC-24 Accept bid creates room" yes "$([ -n "$ROOM" ] && echo yes || echo no)"
chk "TC-25 Cannot bid on non-open bounty (400)" 400 "$(code -X POST $B/api/bounties/$BOUNTY_ID/bids -H "Authorization: Bearer $MENT_TOKEN" -H 'Content-Type: application/json' -d '{"price_offer":100}')"
chk "TC-26 Double-accept rejected (400)" 400 "$(code -X POST $B/api/bids/$BID_ID/accept -H "Authorization: Bearer $STUD_TOKEN")"

echo "===== COMPLETION / REVIEW ====="
chk "TC-27 Complete invalid rating (400)" 400 "$(code -X POST $B/api/bounties/$BOUNTY_ID/complete -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"rating":9}')"
chk "TC-28 Complete bounty + rating (200)" 200 "$(code -X POST $B/api/bounties/$BOUNTY_ID/complete -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"rating":5,"comment":"great"}')"
chk "TC-29 Complete already-closed (400)" 400 "$(code -X POST $B/api/bounties/$BOUNTY_ID/complete -H "Authorization: Bearer $STUD_TOKEN" -H 'Content-Type: application/json' -d '{"rating":5}')"

echo "===== DIRECTORY / PROFILE / INSIGHT ====="
chk "TC-30 Mentor directory (200)" 200 "$(code $B/api/mentors -H "Authorization: Bearer $STUD_TOKEN")"
chk "TC-31 Mentor profile (200)" 200 "$(code $B/api/mentors/$MENT_ID -H "Authorization: Bearer $STUD_TOKEN")"
chk "TC-32 Price insight (200)" 200 "$(code "$B/api/price-insight?subject=Math" -H "Authorization: Bearer $STUD_TOKEN")"
chk "TC-33 Health check (200)" 200 "$(code $B/health)"

echo ""
echo "========================================"
echo "TOTAL: $((pass+fail))  PASS: $pass  FAIL: $fail"
echo "========================================"
[ "$fail" -eq 0 ]
