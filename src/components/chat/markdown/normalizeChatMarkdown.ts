export function normalizeChatMarkdown(input: string): string {
  if (!input) return ""
  const lines = input.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let inFence = false
  const labelRe = /^(Wichtig|Hinweis|Achtung|Info|Tipp|Merke|Warnung)\s*:\s*(.+)\s*$/i
  const headingLike = (s: string) => {
    const t = s.trim()
    if (!t) return false
    if (t.startsWith("#")) return false
    if (t.startsWith("```")) return false
    if (t.startsWith(">")) return false
    if (t.startsWith("-") || t.startsWith("*")) return false
    if (/^\d+\.\s+/.test(t)) return false
    if (!t.endsWith(":")) return false
    const core = t.slice(0, -1).trim()
    if (!core) return false
    if (core.length > 64) return false
    if (/\bhttps?:\/\//i.test(core)) return false
    if (/[.!?]$/.test(core)) return false
    const words = core.split(/\s+/).filter(Boolean)
    if (words.length > 8) return false
    return true
  }
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? ""
    const t = raw.trim()
    if (t.startsWith("```")) {
      inFence = !inFence
      out.push(raw)
      continue
    }
    if (inFence) {
      out.push(raw)
      continue
    }
    const m = raw.match(labelRe)
    if (m) {
      const label = (m[1] || "").trim()
      const rest = (m[2] || "").trim()
      out.push(`**${label.charAt(0).toUpperCase()}${label.slice(1).toLowerCase()}:** ${rest}`)
      continue
    }
    if (headingLike(raw)) {
      const title = raw.trim().slice(0, -1).trim()
      if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("")
      out.push(`## ${title}`)
      const next = lines[i + 1] ?? ""
      if (next.trim() !== "") out.push("")
      continue
    }
    out.push(raw)
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

// Wandelt Memory-Marker [[mem:ID|Label]] in Markdown-Links um
export function injectMemoryMarkersToLinks(content: string): string {
  if (!content) return ""
  return content.replace(/\[\[mem:([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, id, label) => {
    const safeId = encodeURIComponent(String(id))
    const safeLabel = label ? String(label) : "Memory"
    return `[${safeLabel}](aklow-mem://${safeId})`
  })
}
