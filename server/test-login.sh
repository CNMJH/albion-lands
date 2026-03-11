#!/bin/bash
# 简单测试 - 登录

echo "测试登录..."
curl -X POST "http://localhost:3002/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"password123"}' \
  2>&1

echo ""
