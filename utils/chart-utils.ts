// Utility functions for safely working with ApexCharts

/**
 * Safely checks if ApexCharts is available in the global scope
 */
export function isApexChartsAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.ApexCharts !== "undefined"
}

/**
 * Safely destroys an ApexCharts instance
 */
export function safelyDestroyChart(chartInstance: any): void {
  try {
    if (chartInstance && typeof chartInstance.destroy === "function") {
      chartInstance.destroy()
    }
  } catch (error) {
    console.error("Error destroying chart:", error)
  }
}

/**
 * Safely clears a DOM element
 */
export function safelyClearElement(element: HTMLElement | null): void {
  if (!element) return

  try {
    // Use a safer approach than innerHTML = ''
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  } catch (error) {
    console.error("Error clearing element:", error)
    // Fallback to innerHTML if removeChild fails
    try {
      element.innerHTML = ""
    } catch (innerError) {
      console.error("Error using innerHTML fallback:", innerError)
    }
  }
}

/**
 * Creates a loading indicator element
 */
export function createLoadingIndicator(): HTMLDivElement {
  const container = document.createElement("div")
  container.className = "h-full flex items-center justify-center"

  const content = document.createElement("div")
  content.className = "text-center"

  const spinner = document.createElement("div")
  spinner.className = "animate-spin rounded-full h-12 w-12 border-b-2 border-fgpu-volt mx-auto mb-4"

  const text = document.createElement("p")
  text.className = "text-fgpu-stone-500 dark:text-fgpu-stone-400"
  text.textContent = "Loading chart..."

  content.appendChild(spinner)
  content.appendChild(text)
  container.appendChild(content)

  return container
}

/**
 * Creates an error indicator element
 */
export function createErrorIndicator(message = "Unable to load chart"): HTMLDivElement {
  const container = document.createElement("div")
  container.className = "h-full flex items-center justify-center"

  const content = document.createElement("div")
  content.className = "text-center"

  const icon = document.createElement("div")
  icon.className = "text-fgpu-stone-400 text-4xl mb-2"
  icon.innerHTML = "⚠️"

  const text = document.createElement("p")
  text.className = "text-fgpu-stone-500 dark:text-fgpu-stone-400"
  text.textContent = message

  content.appendChild(icon)
  content.appendChild(text)
  container.appendChild(content)

  return container
}

