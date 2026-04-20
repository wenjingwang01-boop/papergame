import urllib.request
import urllib.parse
import json

print("测试游戏服务器API...")
print("=" * 50)

def test_api(endpoint, data):
    url = f'http://localhost:3001/api{endpoint}'
    headers = {'Content-Type': 'application/json'}
    data = json.dumps(data).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            data = json.loads(content)
            print(f"状态码: {response.getcode()}")
            print(f"响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
            return data
    except Exception as e:
        print(f"错误: {e}")
        return None

# 测试创建房间
print("1. 测试创建房间:")
data = test_api('/createRoom', {'playerName': '测试玩家'})

if data and data.get('success'):
    room_id = data.get('roomId')
    print(f"房间ID: {room_id}")
    
    # 测试获取房间
    print("\n2. 测试获取房间:")
    test_api('/getRoom', {'roomId': room_id})
    
    # 测试加入房间
    print("\n3. 测试加入房间:")
    test_api('/joinRoom', {'roomId': room_id, 'playerName': '测试玩家2'})
    
    # 测试开始游戏
    print("\n4. 测试开始游戏:")
    test_api('/startGame', {'roomId': room_id})

print("=" * 50)
print("测试完成")