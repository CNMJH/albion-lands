#!/usr/bin/env node
/**
 * 怪物精灵图表合并脚本
 * 将 PNG 序列合并为 sprite sheets
 * 支持两种结构:
 * 1. 扁平结构：Attack1.png, Attack2.png...
 * 2. 文件夹结构：Attack/Attack1.png, Attack/Attack2.png...
 */

const fs = require('fs');
const path = require('path');

// 使用 canvas 库
const { createCanvas, loadImage } = require('canvas');

function extractAnimationType(filename) {
    // 从文件名提取动画类型，如 "Attack1.png" -> "Attack"
    const match = filename.match(/^([A-Za-z_]+)\d+\.png$/);
    return match ? match[1] : null;
}

function groupFilesByAnimation(files) {
    const groups = {};
    
    for (const file of files) {
        const animType = extractAnimationType(file);
        if (animType) {
            if (!groups[animType]) {
                groups[animType] = [];
            }
            groups[animType].push(file);
        }
    }
    
    // 排序每个组
    for (const animType in groups) {
        groups[animType].sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });
    }
    
    return groups;
}

async function mergeAnimationFrames(files, folder, outputPrefix) {
    if (files.length === 0) {
        return null;
    }
    
    // 加载第一帧获取尺寸
    const firstImg = await loadImage(path.join(folder, files[0]));
    const frameWidth = firstImg.width;
    const frameHeight = firstImg.height;
    
    // 创建画布（水平排列所有帧）
    const totalWidth = frameWidth * files.length;
    const canvas = createCanvas(totalWidth, frameHeight);
    const ctx = canvas.getContext('2d');
    
    // 绘制所有帧
    for (let i = 0; i < files.length; i++) {
        const img = await loadImage(path.join(folder, files[i]));
        ctx.drawImage(img, i * frameWidth, 0);
    }
    
    // 保存
    const outputPath = `${outputPrefix}.png`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✓ ${path.basename(outputPath)} (${files.length}帧，${totalWidth}x${frameHeight})`);
    
    return {
        path: outputPath,
        frames: files.length,
        frameWidth,
        frameHeight,
        totalWidth
    };
}

async function processMonster(monsterName, basePath = 'assets/monsters') {
    console.log(`\n处理怪物：${monsterName}`);
    
    const monsterPath = path.join(basePath, 'PNG', monsterName);
    const outputPath = path.join(basePath, monsterName);
    
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // 获取所有 PNG 文件
    const files = fs.readdirSync(monsterPath).filter(f => f.endsWith('.png'));
    
    if (files.length === 0) {
        console.log(`  跳过：没有 PNG 文件`);
        return {};
    }
    
    // 按动画类型分组
    const groups = groupFilesByAnimation(files);
    
    console.log(`  发现 ${Object.keys(groups).length} 种动画：${Object.keys(groups).join(', ')}`);
    
    const animations = {};
    
    // 动画类型映射（标准化命名）
    const animationMap = {
        'Idle': 'idle',
        'Walk': 'walk',
        'Attack': 'attack',
        'Hurt': 'hurt',
        'Death': 'death',
        'Fire_Attack': 'fire_attack',
        'Magic_Attack': 'magic_attack',
        'Flight': 'flight',
        'Stone': 'stone'
    };
    
    for (const [animName, files] of Object.entries(groups)) {
        const animKey = animationMap[animName] || animName.toLowerCase();
        const result = await mergeAnimationFrames(
            files,
            monsterPath,
            path.join(outputPath, animKey)
        );
        if (result) {
            animations[animKey] = result;
        }
    }
    
    return animations;
}

async function main() {
    const basePath = 'assets/monsters';
    const pngPath = path.join(basePath, 'PNG');
    
    if (!fs.existsSync(pngPath)) {
        console.error(`错误：${pngPath} 不存在`);
        process.exit(1);
    }
    
    // 获取所有怪物文件夹
    const monsters = fs.readdirSync(pngPath)
        .filter(d => fs.statSync(path.join(pngPath, d)).isDirectory());
    
    console.log(`发现 ${monsters.length} 个怪物：${monsters.join(', ')}`);
    
    const allAnimations = {};
    
    for (const monster of monsters) {
        const animations = await processMonster(monster, basePath);
        allAnimations[monster] = animations;
    }
    
    // 生成配置 JSON
    const config = {
        monsters: {}
    };
    
    for (const [monster, animations] of Object.entries(allAnimations)) {
        config.monsters[monster] = {};
        for (const [animName, animData] of Object.entries(animations)) {
            config.monsters[monster][animName] = {
                texture: animData.path,
                frames: animData.frames,
                frameWidth: animData.frameWidth,
                frameHeight: animData.frameHeight
            };
        }
    }
    
    // 保存配置
    const configPath = path.join(basePath, 'monster_animations.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    
    console.log(`\n✓ 配置已保存到：${configPath}`);
    console.log(`\n完成！共处理 ${monsters.length} 个怪物`);
}

main().catch(console.error);
