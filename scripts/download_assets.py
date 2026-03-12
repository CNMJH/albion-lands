#!/usr/bin/env python3
"""
下载 OpenGameArt 免费像素素材
用于呼噜大陆 (Hulu Lands) 游戏开发
"""

import os
import requests
from pathlib import Path

BASE_DIR = Path("/home/tenbox/albion-lands/assets")

# 免费素材资源 URL (CC0/CC-BY 许可)
RESOURCES = {
    # 角色精灵
    "characters": [
        {
            "name": "lpc_warrior.png",
            "url": "https://opengameart.org/sites/default/files/LPCcharacters_0.png",
            "desc": "LPC 中世纪角色精灵"
        },
        {
            "name": "pixel_hero.png",
            "url": "https://opengameart.org/sites/default/files/hero_12.png",
            "desc": "像素英雄角色"
        }
    ],
    
    # 怪物精灵
    "monsters": [
        {
            "name": "lpc_monsters.png",
            "url": "https://opengameart.org/sites/default/files/monster%20sprites.png",
            "desc": "LPC 怪物精灵"
        }
    ],
    
    # 地砖
    "tiles": [
        {
            "name": "grass_tile.png",
            "url": "https://opengameart.org/sites/default/files/GrassTile.png",
            "desc": "草地地砖"
        },
        {
            "name": "lpc_ground.png",
            "url": "https://opengameart.org/sites/default/files/ground.png",
            "desc": "LPC 地面纹理"
        }
    ],
    
    # 物品图标
    "items": [
        {
            "name": "lpc_items.png",
            "url": "https://opengameart.org/sites/default/files/LPCitems_0.png",
            "desc": "LPC 物品图标"
        }
    ]
}

def download_file(url, dest_path):
    """下载文件到指定路径"""
    try:
        print(f"下载：{url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        with open(dest_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ 已保存：{dest_path}")
        return True
    except Exception as e:
        print(f"✗ 下载失败 {url}: {e}")
        return False

def main():
    print("=" * 60)
    print("呼噜大陆 - 免费游戏素材下载器")
    print("=" * 60)
    
    total = 0
    success = 0
    
    for category, resources in RESOURCES.items():
        category_dir = BASE_DIR / category
        category_dir.mkdir(exist_ok=True)
        
        print(f"\n[{category.upper()}]")
        
        for resource in resources:
            total += 1
            dest_path = category_dir / resource["name"]
            
            if download_file(resource["url"], dest_path):
                success += 1
    
    print("\n" + "=" * 60)
    print(f"下载完成：{success}/{total}")
    print("=" * 60)

if __name__ == "__main__":
    main()
