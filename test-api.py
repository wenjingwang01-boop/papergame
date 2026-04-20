import requests
import json

print("测试游戏服务器API...")
print("=" * 50)

# 测试创建房间
print("1. 测试创建房间:")
try:
    response = requests.post('http://localhost:3001/api/createRoom', json={'playerName': '测试玩家'})
    data = response.json()
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    if data.get('success'):
        room_id = data.get('roomId')
        print(f"房间ID: {room_id}")
        
        # 测试获取房间
        print("\n2. 测试获取房间:")
        response = requests.post('http://localhost:3001/api/getRoom', json={'roomId': room_id})
        data = response.json()
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # 测试加入房间
        print("\n3. 测试加入房间:")
        response = requests.post('http://localhost:3001/api/joinRoom', json={'roomId': room_id, 'playerName': '测试玩家2'})
        data = response.json()
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        # 测试开始游戏
        print("\n4. 测试开始游戏:")
        response = requests.post('http://localhost:3001/api/startGame', json={'roomId': room_id})
        data = response.json()
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
except Exception as e:
    print(f"错误: {e}")

print("=" * 50)
print("测试完成")