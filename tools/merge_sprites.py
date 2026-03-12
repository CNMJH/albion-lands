#!/usr/bin/env python3
"""
怪物精灵图表合并脚本
将 PNG 序列合并为 sprite sheets
"""

import os
import sys
from PIL import Image

def get_image_size(folder):
    """获取文件夹中第一个图片的尺寸"""
    for file in os.listdir(folder):
        if file.endswith('.png'):
            img = Image.open(os.path.join(folder, file))
            return img.size
    return (64, 64)

def merge_animation_frames(folder, output_prefix):
    """合并动画帧为水平 sprite sheet"""
    if not os.path.exists(folder):
        print(f"跳过：{folder} 不存在")
        return []
    
    # 获取所有 PNG 文件并排序
    files = sorted([f for f in os.listdir(folder) if f.endswith('.png')])
    
    if not files:
        print(f"跳过：{folder} 没有 PNG 文件")
        return []
    
    # 获取单帧尺寸
    first_img = Image.open(os.path.join(folder, files[0]))
    frame_width, frame_height = first_img.size
    
    # 创建合并的图片（水平排列）
    total_width = frame_width * len(files)
    merged_img = Image.new('RGBA', (total_width, frame_height), (0, 0, 0, 0))
    
    # 粘贴所有帧
    for i, file in enumerate(files):
        img = Image.open(os.path.join(folder, file))
        merged_img.paste(img, (i * frame_width, 0))
    
    # 保存
    output_path = f"{output_prefix}.png"
    merged_img.save(output_path)
    
    print(f"✓ {output_path} ({len(files)}帧，{total_width}x{frame_height})")
    
    return {
        'path': output_path,
        'frames': len(files),
        'frame_width': frame_width,
        'frame_height': frame_height,
        'total_width': total_width
    }

def process_monster(monster_name, base_path='assets/monsters'):
    """处理单个怪物的所有动画"""
    print(f"\n处理怪物：{monster_name}")
    
    monster_path = os.path.join(base_path, 'PNG', monster_name)
    output_path = os.path.join(base_path, monster_name)
    
    os.makedirs(output_path, exist_ok=True)
    
    animations = {}
    
    # 动画类型映射
    animation_types = {
        'Idle': 'idle',
        'Walk': 'walk',
        'Attack': 'attack',
        'Hurt': 'hurt',
        'Death': 'death',
        'Fire_Attack': 'fire_attack',
        'Magic_Attack': 'magic_attack',
        'Flight': 'flight',
        'Stone': 'stone'
    }
    
    for anim_name, anim_key in animation_types.items():
        anim_folder = os.path.join(monster_path, anim_name)
        if os.path.exists(anim_folder):
            result = merge_animation_frames(
                anim_folder,
                os.path.join(output_path, anim_key)
            )
            if result:
                animations[anim_key] = result
    
    return animations

def main():
    base_path = 'assets/monsters'
    png_path = os.path.join(base_path, 'PNG')
    
    if not os.path.exists(png_path):
        print(f"错误：{png_path} 不存在")
        sys.exit(1)
    
    # 获取所有怪物文件夹
    monsters = [d for d in os.listdir(png_path) if os.path.isdir(os.path.join(png_path, d))]
    
    print(f"发现 {len(monsters)} 个怪物：{', '.join(monsters)}")
    
    all_animations = {}
    
    for monster in monsters:
        animations = process_monster(monster, base_path)
        all_animations[monster] = animations
    
    # 生成配置 JSON
    import json
    config = {
        'monsters': {}
    }
    
    for monster, animations in all_animations.items():
        config['monsters'][monster] = {}
        for anim_name, anim_data in animations.items():
            config['monsters'][monster][anim_name] = {
                'texture': anim_data['path'],
                'frames': anim_data['frames'],
                'frameWidth': anim_data['frame_width'],
                'frameHeight': anim_data['frame_height']
            }
    
    # 保存配置
    config_path = os.path.join(base_path, 'monster_animations.json')
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ 配置已保存到：{config_path}")
    print(f"\n完成！共处理 {len(monsters)} 个怪物")

if __name__ == '__main__':
    main()
