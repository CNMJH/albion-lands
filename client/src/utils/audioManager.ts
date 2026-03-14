/**
 * 音频管理器
 * 管理游戏背景音乐和音效
 */

export interface AudioConfig {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  muted: boolean
}

export interface SoundEffect {
  name: string
  src: string
  volume?: number
}

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null
  private sfxPool: Map<string, HTMLAudioElement[]> = new Map()
  private config: AudioConfig = {
    masterVolume: 0.5,
    musicVolume: 0.5,
    sfxVolume: 0.5,
    muted: false
  }
  private currentBgm: string | null = null
  private bgmFadeInterval: number | null = null

  constructor() {
    this.init()
  }

  /**
   * 初始化
   */
  private init() {
    // 加载配置
    this.loadConfig()
  }

  /**
   * 加载配置
   */
  private loadConfig() {
    try {
      const saved = localStorage.getItem('hulu_lands_audio')
      if (saved) {
        this.config = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load audio config:', e)
    }
  }

  /**
   * 保存配置
   */
  private saveConfig() {
    try {
      localStorage.setItem('hulu_lands_audio', JSON.stringify(this.config))
    } catch (e) {
      console.warn('Failed to save audio config:', e)
    }
  }

  /**
   * 预加载音效
   */
  preloadSFX(effects: SoundEffect[]) {
    effects.forEach((effect) => {
      if (!this.sfxPool.has(effect.name)) {
        this.sfxPool.set(effect.name, [])
      }

      // 创建 3 个实例用于并发播放
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(effect.src)
        audio.preload = 'auto'
        this.sfxPool.get(effect.name)!.push(audio)
      }
    })
  }

  /**
   * 播放背景音乐
   */
  playBGM(src: string, loop: boolean = true, fadeInSeconds: number = 1) {
    if (this.currentBgm === src) {
      return
    }

    // 淡出当前 BGM
    this.fadeOutBGM(fadeInSeconds)

    setTimeout(() => {
      // 停止当前 BGM
      if (this.bgmAudio) {
        this.bgmAudio.pause()
        this.bgmAudio.currentTime = 0
      }

      // 创建新的 BGM
      this.bgmAudio = new Audio(src)
      this.bgmAudio.loop = loop
      this.bgmAudio.volume = 0

      this.bgmAudio.addEventListener('canplay', () => {
        this.currentBgm = src
        this.fadeInBGM(fadeInSeconds)
      })

      this.bgmAudio.addEventListener('error', (e) => {
        console.error('BGM load error:', e)
      })

      this.bgmAudio.play().catch((e) => {
        console.warn('BGM play error:', e)
      })
    }, fadeInSeconds * 1000)
  }

  /**
   * 淡入 BGM
   */
  private fadeInBGM(duration: number) {
    if (!this.bgmAudio) return

    const targetVolume = this.config.musicVolume * this.config.masterVolume
    const step = targetVolume / (duration * 60) // 60fps

    if (this.bgmFadeInterval) {
      clearInterval(this.bgmFadeInterval)
    }

    this.bgmFadeInterval = window.setInterval(() => {
      if (!this.bgmAudio) {
        clearInterval(this.bgmFadeInterval!)
        return
      }

      if (this.bgmAudio.volume < targetVolume) {
        this.bgmAudio.volume = Math.min(this.bgmAudio.volume + step, targetVolume)
      } else {
        clearInterval(this.bgmFadeInterval!)
      }
    }, 1000 / 60)
  }

  /**
   * 淡出 BGM
   */
  private fadeOutBGM(duration: number) {
    if (!this.bgmAudio) return

    const step = this.bgmAudio.volume / (duration * 60)

    if (this.bgmFadeInterval) {
      clearInterval(this.bgmFadeInterval)
    }

    this.bgmFadeInterval = window.setInterval(() => {
      if (!this.bgmAudio) {
        clearInterval(this.bgmFadeInterval!)
        return
      }

      if (this.bgmAudio.volume > 0) {
        this.bgmAudio.volume = Math.max(this.bgmAudio.volume - step, 0)
      } else {
        clearInterval(this.bgmFadeInterval!)
      }
    }, 1000 / 60)
  }

  /**
   * 停止 BGM
   */
  stopBGM(fadeOutSeconds: number = 0.5) {
    this.fadeOutBGM(fadeOutSeconds)
    
    setTimeout(() => {
      if (this.bgmAudio) {
        this.bgmAudio.pause()
        this.bgmAudio.currentTime = 0
      }
      this.currentBgm = null
    }, fadeOutSeconds * 1000)
  }

  /**
   * 播放音效
   */
  playSFX(name: string, volume: number = 1) {
    if (this.config.muted) {
      return
    }

    const pool = this.sfxPool.get(name)
    if (!pool || pool.length === 0) {
      console.warn(`SFX not found: ${name}`)
      return
    }

    // 找到可用的音频实例
    let audio = pool.find((a) => a.paused || a.ended)
    if (!audio) {
      // 所有实例都在播放，克隆一个新的
      const firstAudio = pool[0]
      if (firstAudio) {
        audio = firstAudio.cloneNode() as HTMLAudioElement
        pool.push(audio)
      } else {
        return
      }
    }

    if (!audio) return

    const finalVolume = volume * this.config.sfxVolume * this.config.masterVolume
    audio.volume = finalVolume
    audio.currentTime = 0
    audio.play().catch((e) => {
      console.warn('SFX play error:', e)
    })
  }

  /**
   * 暂停所有音频
   */
  pauseAll() {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
    }

    this.sfxPool.forEach((pool) => {
      pool.forEach((audio) => audio.pause())
    })
  }

  /**
   * 恢复所有音频
   */
  resumeAll() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {})
    }
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number) {
    this.config.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveConfig()
    this.updateVolumes()
  }

  /**
   * 设置音乐音量
   */
  setMusicVolume(volume: number) {
    this.config.musicVolume = Math.max(0, Math.min(1, volume))
    this.saveConfig()
    this.updateVolumes()
  }

  /**
   * 设置音效音量
   */
  setSFXVolume(volume: number) {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveConfig()
  }

  /**
   * 静音切换
   */
  toggleMute() {
    this.config.muted = !this.config.muted
    this.saveConfig()
    this.updateVolumes()
  }

  /**
   * 设置静音
   */
  setMute(muted: boolean) {
    this.config.muted = muted
    this.saveConfig()
    this.updateVolumes()
  }

  /**
   * 更新音量
   */
  private updateVolumes() {
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.config.muted ? 0 : this.config.musicVolume * this.config.masterVolume
    }
  }

  /**
   * 获取配置
   */
  getConfig(): AudioConfig {
    return { ...this.config }
  }

  /**
   * 检查是否支持音频
   */
  static isSupported(): boolean {
    return typeof Audio !== 'undefined'
  }

  /**
   * 请求音频上下文 (用于解锁移动端音频)
   */
  static requestAudioContext() {
    // 创建并播放一个 silent 音频来解锁移动端
    const audio = new Audio()
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA=='
    audio.play().catch(() => {})
  }
}

// 单例
export const audioManager = new AudioManager()

/**
 * 播放音效快捷函数
 */
export function playSFX(name: string, volume?: number) {
  audioManager.playSFX(name, volume)
}

/**
 * 播放 BGM 快捷函数
 */
export function playBGM(src: string, loop?: boolean, fadeInSeconds?: number) {
  audioManager.playBGM(src, loop, fadeInSeconds)
}

/**
 * 停止 BGM 快捷函数
 */
export function stopBGM(fadeOutSeconds?: number) {
  audioManager.stopBGM(fadeOutSeconds)
}

/**
 * 获取音效预设
 */
export const SFXPresets = {
  // 战斗
  ATTACK_SWING: 'attack_swing',
  ATTACK_HIT: 'attack_hit',
  SKILL_CAST: 'skill_cast',
  SKILL_HIT: 'skill_hit',
  DEATH: 'death',
  
  // UI
  UI_CLICK: 'ui_click',
  UI_HOVER: 'ui_hover',
  UI_OPEN: 'ui_open',
  UI_CLOSE: 'ui_close',
  
  // 环境
  FOOTSTEP_GRASS: 'footstep_grass',
  FOOTSTEP_STONE: 'footstep_stone',
  FOOTSTEP_WATER: 'footstep_water',
  
  // 物品
  ITEM_PICKUP: 'item_pickup',
  ITEM_DROP: 'item_drop',
  ITEM_CRAFT: 'item_craft',
  
  // 通知
  NOTIFICATION: 'notification',
  ACHIEVEMENT: 'achievement',
  LEVEL_UP: 'level_up'
} as const
