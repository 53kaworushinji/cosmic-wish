# 数据结构设计

## 1. 愿望对象 (Wish Object)

```javascript
{
  id: string,              // 唯一标识符 (UUID)
 困境描述: string,         // 用户当前遇到的挑战
  困难程度: number,         // 1-100的数字
  期望成果: string,         // 用户希望达成的目标
  当前能量: number,         // 用户注入的能量值
  是否达成: boolean,        // 愿望是否已达成
  创建时间: string,         // ISO时间格式
  更新时间: string,         // ISO时间格式
  能量记录: Array<{      // 能量注入记录数组
    id: string,            // 记录唯一标识符
    内容: string,          // 用户的努力记录
    时间: string           // ISO时间格式
  }>
}
```

## 2. localStorage存储方案

```javascript
// 存储所有愿望的键
WISH_PLANET_WISHES = [wishObject1, wishObject2, ...]

// 存储已完成愿望的键 (可选，也可以用属性标记)
WISH_PLANET_FULFILLED_WISHES = [wishObject1, wishObject2, ...]
```

## 3. 示例数据

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  困境描述: "学习编程太难了，总是遇到bug",
  困难程度: 80,
  期望成果: "成为一名优秀的前端工程师",
  当前能量: 15,
  是否达成: false,
  创建时间: "2025-09-07T10:00:00.000Z",
  更新时间: "2025-09-07T15:30:00.000Z",
  能量记录: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      内容: "今天虽然很累，但我还是读了30分钟JavaScript教程",
      时间: "2025-09-07T10:30:00.000Z"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      内容: "完成了3个编程练习题，感觉有点进步",
      时间: "2025-09-07T15:30:00.000Z"
    }
  ]
}
```