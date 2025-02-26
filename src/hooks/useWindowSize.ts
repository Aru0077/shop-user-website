import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowSize() {
      const width = ref(window.innerWidth)
      const height = ref(window.innerHeight)
      const isMobile = ref(window.innerWidth < 768)

      function handleResize() {
            width.value = window.innerWidth
            height.value = window.innerHeight
            isMobile.value = window.innerWidth < 768
      }

      onMounted(() => {
            window.addEventListener('resize', handleResize)
      })

      onUnmounted(() => {
            window.removeEventListener('resize', handleResize)
      })

      return {
            width,
            height,
            isMobile
      }
}