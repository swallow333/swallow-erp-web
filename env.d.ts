/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// 声明 CSS 模块
declare module '*.css' {
    const content: { [className: string]: string }
    export default content
}

declare module '*.scss' {
    const content: { [className: string]: string }
    export default content
}