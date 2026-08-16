import requests
import sys

class YouTubeAPITester:
    def __init__(self, base_url="https://group-play-sync-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, params=None, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    resp_data = response.json()
                    print(f"   Response preview: {str(resp_data)[:200]}")
                except Exception:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, None

    def test_youtube_search_valid(self):
        """Test YouTube search with valid query"""
        success, response = self.run_test(
            "YouTube Search - Valid Query",
            "GET",
            "api/youtube/search",
            200,
            params={"q": "karaoke"}
        )
        if success:
            data = response.json()
            if 'items' in data and isinstance(data['items'], list):
                print(f"   ✓ Found {len(data['items'])} items")
                if len(data['items']) > 0:
                    item = data['items'][0]
                    required_fields = ['video_id', 'title', 'thumbnail', 'channel_title']
                    missing = [f for f in required_fields if f not in item]
                    if missing:
                        print(f"   ⚠️  Missing fields in item: {missing}")
                    else:
                        print(f"   ✓ All required fields present")
                if 'nextPageToken' in data:
                    print(f"   ✓ nextPageToken present: {data['nextPageToken'][:20]}...")
            else:
                print(f"   ⚠️  Response missing 'items' array")
        return success

    def test_youtube_search_empty_query(self):
        """Test YouTube search with empty query (should return 422)"""
        success, response = self.run_test(
            "YouTube Search - Empty Query",
            "GET",
            "api/youtube/search",
            422,
            params={"q": ""}
        )
        return success

    def test_youtube_search_missing_query(self):
        """Test YouTube search with missing query parameter (should return 422)"""
        success, response = self.run_test(
            "YouTube Search - Missing Query",
            "GET",
            "api/youtube/search",
            422,
            params={}
        )
        return success

    def test_youtube_search_pagination(self):
        """Test YouTube search pagination"""
        # First, get initial results
        print(f"\n🔍 Testing YouTube Search - Pagination (Step 1: Get initial results)...")
        success1, response1 = self.run_test(
            "YouTube Search - Initial Results",
            "GET",
            "api/youtube/search",
            200,
            params={"q": "karaoke", "maxResults": 3}
        )
        
        if not success1:
            return False
        
        data1 = response1.json()
        next_token = data1.get('nextPageToken')
        
        if not next_token:
            print(f"   ⚠️  No nextPageToken in response, pagination test incomplete")
            return True  # Not a failure, just no pagination available
        
        print(f"   ✓ Got nextPageToken: {next_token[:20]}...")
        
        # Now test with pageToken
        print(f"\n🔍 Testing YouTube Search - Pagination (Step 2: Use pageToken)...")
        success2, response2 = self.run_test(
            "YouTube Search - With PageToken",
            "GET",
            "api/youtube/search",
            200,
            params={"q": "karaoke", "pageToken": next_token, "maxResults": 3}
        )
        
        if success2:
            data2 = response2.json()
            if 'items' in data2 and len(data2['items']) > 0:
                print(f"   ✓ Pagination working, got {len(data2['items'])} more items")
            else:
                print(f"   ⚠️  Pagination returned no items")
        
        return success2

def main():
    print("=" * 60)
    print("YouTube Karaoke Backend API Tests")
    print("=" * 60)
    
    tester = YouTubeAPITester()
    
    # Run all tests
    tester.test_youtube_search_valid()
    tester.test_youtube_search_empty_query()
    tester.test_youtube_search_missing_query()
    tester.test_youtube_search_pagination()
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("=" * 60)
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for fail in tester.failed_tests:
            print(f"  - {fail.get('test', 'Unknown')}")
            if 'error' in fail:
                print(f"    Error: {fail['error']}")
            else:
                print(f"    Expected: {fail.get('expected')}, Got: {fail.get('actual')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
