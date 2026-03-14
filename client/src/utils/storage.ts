/**
 * 本地存储工具
 * 封装 localStorage，提供类型安全和过期机制
 */

export interface StorageOptions {
  expire?: number // 过期时间 (毫秒)
  encrypt?: boolean // 是否加密 (简化版，base64)
}

interface StoredData<T> {
  value: T
  timestamp: number
  expire?: number
}

class LocalStorageManager {
  private prefix: string = 'hulu_lands_'

  constructor(prefix?: string) {
    if (prefix) {
      this.prefix = prefix
    }
  }

  /**
   * 生成键名
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * 设置数据
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): void {
    try {
      const storedData: StoredData<T> = {
        value,
        timestamp: Date.now(),
        expire: options.expire
      }

      const serialized = JSON.stringify(storedData)
      const toStore = options.encrypt ? btoa(serialized) : serialized

      localStorage.setItem(this.getKey(key), toStore)
    } catch (error) {
      console.error('LocalStorage set error:', error)
    }
  }

  /**
   * 获取数据
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(this.getKey(key))
      
      if (!item) {
        return defaultValue
      }

      // 尝试解密
      let serialized = item
      try {
        serialized = atob(item)
      } catch (e) {
        // 不是加密数据，直接使用
      }

      const storedData: StoredData<T> = JSON.parse(serialized)

      // 检查过期
      if (storedData.expire) {
        const age = Date.now() - storedData.timestamp
        if (age > storedData.expire) {
          this.remove(key)
          return defaultValue
        }
      }

      return storedData.value
    } catch (error) {
      console.error('LocalStorage get error:', error)
      return defaultValue
    }
  }

  /**
   * 移除数据
   */
  remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.replace(this.prefix, ''))
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    const item = localStorage.getItem(this.getKey(key))
    
    if (!item) {
      return false
    }

    // 检查过期
    try {
      let serialized = item
      try {
        serialized = atob(item)
      } catch (e) {}

      const storedData: StoredData<any> = JSON.parse(serialized)
      
      if (storedData.expire) {
        const age = Date.now() - storedData.timestamp
        if (age > storedData.expire) {
          this.remove(key)
          return false
        }
      }
      
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 获取存储大小 (字节)
   */
  getSize(): number {
    let size = 0
    const keys = this.keys()
    
    keys.forEach((key) => {
      const item = localStorage.getItem(this.getKey(key))
      if (item) {
        size += item.length
      }
    })
    
    return size
  }

  /**
   * 获取存储大小 (人类可读)
   */
  getSizeFormatted(): string {
    const size = this.getSize()
    
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    }
  }

  /**
   * 导出所有数据
   */
  export(): Record<string, any> {
    const result: Record<string, any> = {}
    const keys = this.keys()
    
    keys.forEach((key) => {
      result[key] = this.get(key)
    })
    
    return result
  }

  /**
   * 导入数据
   */
  import(data: Record<string, any>): void {
    Object.keys(data).forEach((key) => {
      this.set(key, data[key])
    })
  }
}

// 游戏存储单例
export const gameStorage = new LocalStorageManager('hulu_lands_')

/**
 * 存储键常量
 */
export const StorageKeys = {
  // 用户设置
  SETTINGS: 'settings',
  KEYBINDINGS: 'keybindings',
  AUDIO: 'audio_settings',
  VIDEO: 'video_settings',
  
  // 游戏状态
  LAST_LOGIN: 'last_login',
  CHARACTER_ID: 'character_id',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  
  // 缓存
  ITEM_CACHE: 'item_cache',
  MAP_CACHE: 'map_cache',
  QUEST_CACHE: 'quest_cache',
  
  // 临时数据
  TEMP_DATA: 'temp_data',
  DRAFT_MESSAGE: 'draft_message'
} as const

/**
 * 获取设置
 */
export function getSettings() {
  return gameStorage.get('settings', {
    music: true,
    sfx: true,
    volume: 0.5,
    fullscreen: false,
    showFPS: false
  })
}

/**
 * 保存设置
 */
export function saveSettings(settings: any) {
  gameStorage.set('settings', settings, { expire: 365 * 24 * 60 * 60 * 1000 }) // 1 年
}

/**
 * 获取按键绑定
 */
export function getKeybindings(): Record<string, string> {
  return gameStorage.get('keybindings', {
    moveUp: 'W',
    moveDown: 'S',
    moveLeft: 'A',
    moveRight: 'D',
    skill1: 'Q',
    skill2: 'W',
    skill3: 'E',
    skill4: 'R',
    inventory: 'B',
    character: 'C',
    market: 'M'
  }) || {}
}

/**
 * 保存按键绑定
 */
export function saveKeybindings(keybindings: any) {
  gameStorage.set('keybindings', keybindings, { expire: 365 * 24 * 60 * 60 * 1000 })
}

/**
 * 获取音频设置
 */
export function getAudioSettings(): Record<string, any> {
  return gameStorage.get('audio', {
    masterVolume: 0.5,
    musicVolume: 0.5,
    sfxVolume: 0.5,
    muted: false
  }) || {}
}

/**
 * 保存音频设置
 */
export function saveAudioSettings(settings: any) {
  gameStorage.set('audio', settings, { expire: 365 * 24 * 60 * 60 * 1000 })
}

/**
 * 检查教程是否完成
 */
export function isTutorialComplete(): boolean {
  return gameStorage.get('tutorial_complete', false) || false
}

/**
 * 标记教程完成
 */
export function setTutorialComplete(): void {
  gameStorage.set('tutorial_complete', true, { expire: 365 * 24 * 60 * 60 * 1000 })
}

/**
 * 获取最后登录时间
 */
export function getLastLogin(): number {
  return gameStorage.get('last_login', 0) || 0
}

/**
 * 更新最后登录时间
 */
export function updateLastLogin(): void {
  gameStorage.set('last_login', Date.now())
}

/**
 * 获取角色 ID
 */
export function getCharacterId(): string | undefined {
  return gameStorage.get('character_id')
}

/**
 * 保存角色 ID
 */
export function saveCharacterId(characterId: string): void {
  gameStorage.set('character_id', characterId, { expire: 365 * 24 * 60 * 60 * 1000 })
}

/**
 * 清除角色数据
 */
export function clearCharacterData(): void {
  gameStorage.remove('character_id')
}
