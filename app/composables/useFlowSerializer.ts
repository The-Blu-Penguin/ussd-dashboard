import type { Node, Edge } from '@vue-flow/core'

// ─── Types matching the backend JSON schema ───

export interface ValidationRule {
  type: string
  minValue?: number
  errorMessage?: string
}

export interface InputConfig {
  variable: string
  validation?: ValidationRule
}

export interface MenuOption {
  input: string
  value: string
  next: string
  set: Record<string, string>
}

export interface FlowStep {
  id: string
  type: 'INPUT' | 'MENU' | 'ACTION' | 'END'
  next?: string
  prompt?: string
  input?: InputConfig
  options?: MenuOption[]
  actionName?: string
  onSuccess?: string
  onFailure?: string
}

export interface MenuConfig {
  entry: string
  steps: FlowStep[]
  version: number
  configId: string
  metadata: Record<string, any>
}

export interface FlowPayload {
  name: string
  type: string
  description: string
  menuConfig: MenuConfig
}

// ─── Vue Flow → Steps ───

export function nodesEdgesToSteps(nodes: Node[], edges: Edge[]): { steps: FlowStep[]; entry: string } {
  // Build adjacency maps
  const outgoing = new Map<string, Edge[]>()
  const incoming = new Map<string, number>()

  for (const edge of edges) {
    const list = outgoing.get(edge.source) || []
    list.push(edge)
    outgoing.set(edge.source, list)
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1)
  }

  // Find entry = node with zero incoming edges (prefer INPUT/MENU)
  let entry = ''
  const candidates = nodes.filter(n => !incoming.has(n.id) && ['INPUT', 'MENU'].includes(n.data?.componentType))
  if (candidates.length > 0) {
    entry = candidates[0]!.id
  } else {
    // Fallback: first INPUT/MENU node
    const first = nodes.find(n => ['INPUT', 'MENU'].includes(n.data?.componentType))
    entry = first?.id || nodes[0]?.id || ''
  }

  // Traverse from entry to build steps in order
  const visited = new Set<string>()
  const steps: FlowStep[] = []

  const traverse = (nodeId: string) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    const step = nodeToStep(node, outgoing.get(nodeId) || [])
    steps.push(step)

    // Follow next targets
    if (step.next) traverse(step.next)
    if (step.onSuccess) traverse(step.onSuccess)
    if (step.onFailure) traverse(step.onFailure)
    if (step.options) {
      for (const opt of step.options) {
        if (opt.next) traverse(opt.next)
      }
    }
  }

  if (entry) traverse(entry)

  // Also include any orphaned END nodes not reached (e.g. failure branches)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      steps.push(nodeToStep(node, outgoing.get(node.id) || []))
    }
  }

  return { steps, entry }
}

function nodeToStep(node: Node, outEdges: Edge[]): FlowStep {
  const type = node.data?.componentType || 'INPUT'
  const base: FlowStep = { id: node.id, type }

  switch (type) {
    case 'INPUT': {
      base.prompt = node.data?.prompt || ''
      base.input = {
        variable: node.data?.variable || '',
        ...(node.data?.validation ? { validation: node.data.validation } : {}),
      }
      const nextEdge = outEdges.find(e => !e.label)
      if (nextEdge) base.next = nextEdge.target
      break
    }

    case 'MENU': {
      base.prompt = node.data?.prompt || ''
      base.options = node.data?.options || []
      // MENU root doesn't have a `next`, each option has its own
      break
    }

    case 'ACTION': {
      base.actionName = node.data?.actionName || ''
      const successEdge = outEdges.find(e => e.label === 'onSuccess')
      const failureEdge = outEdges.find(e => e.label === 'onFailure')
      // Prefer labeled edges (visual connections); fall back to node.data set by the Properties Panel
      base.onSuccess = successEdge?.target || node.data?.onSuccess || undefined
      base.onFailure = failureEdge?.target || node.data?.onFailure || undefined
      break
    }

    case 'END': {
      base.prompt = node.data?.prompt || ''
      break
    }
  }

  return base
}

// ─── Steps → Vue Flow nodes/edges ───

export function stepsToNodesEdges(steps: FlowStep[], entry: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Build a map of step positions
  const positions = new Map<string, { x: number; y: number }>()
  let currentY = 50
  const centerX = 350

  // First pass: assign base positions in step order
  for (const step of steps) {
    positions.set(step.id, { x: centerX, y: currentY })
    currentY += 100
  }

  // Second pass: offset branch targets (onSuccess/onFailure) horizontally
  for (const step of steps) {
    if (step.type === 'ACTION') {
      if (step.onSuccess) {
        const pos = positions.get(step.onSuccess)
        if (pos && pos.x === centerX) {
          pos.x = 200
          pos.y = Math.max(pos.y, (positions.get(step.id)?.y || 0) + 130)
        }
      }
      if (step.onFailure) {
        const pos = positions.get(step.onFailure)
        if (pos && pos.x === centerX) {
          pos.x = 500
          pos.y = Math.max(pos.y, (positions.get(step.id)?.y || 0) + 130)
        }
      }
    }
  }

  // Create nodes
  for (const step of steps) {
    const pos = positions.get(step.id) || { x: centerX, y: currentY }
    nodes.push(stepToNode(step, pos))
  }

  // Create edges
  for (const step of steps) {
    if (step.next) {
      edges.push({
        id: `e-${step.id}-${step.next}`,
        source: step.id,
        target: step.next,
        animated: true,
        style: { stroke: '#3b82f6' },
      })
    }
    if (step.onSuccess) {
      edges.push({
        id: `e-${step.id}-${step.onSuccess}`,
        source: step.id,
        target: step.onSuccess,
        animated: true,
        label: 'onSuccess',
        style: { stroke: '#22c55e' },
        labelBgStyle: { fill: '#f0fdf4' },
      })
    }
    if (step.onFailure) {
      edges.push({
        id: `e-${step.id}-${step.onFailure}`,
        source: step.id,
        target: step.onFailure,
        animated: true,
        label: 'onFailure',
        style: { stroke: '#ef4444' },
        labelBgStyle: { fill: '#fef2f2' },
      })
    }
    if (step.options) {
      for (const opt of step.options) {
        if (opt.next) {
          edges.push({
            id: `e-${step.id}-${opt.next}-${opt.input}`,
            source: step.id,
            target: opt.next,
            animated: true,
            label: opt.input,
            style: { stroke: '#3b82f6' },
          })
        }
      }
    }
  }

  return { nodes, edges }
}

function stepToNode(step: FlowStep, position: { x: number; y: number }): Node {
  const baseData: Record<string, any> = {
    componentType: step.type,
  }

  let classNames = 'bg-white border-2 border-blue-400 rounded-lg shadow-sm text-center p-3'
  let nodeType = 'default'

  switch (step.type) {
    case 'INPUT': {
      classNames = 'bg-vibes-50 border-2 border-vibes-500 rounded-lg shadow-sm text-center p-3 font-medium'
      nodeType = 'input'
      baseData.prompt = step.prompt || ''
      baseData.variable = step.input?.variable || ''
      baseData.validation = step.input?.validation
      break
    }
    case 'MENU': {
      classNames = 'bg-blue-50 border-2 border-blue-500 rounded-lg shadow-sm text-center p-3 font-medium'
      baseData.prompt = step.prompt || ''
      baseData.options = step.options || []
      break
    }
    case 'ACTION': {
      classNames = 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium'
      baseData.actionName = step.actionName || ''
      // Persist branch targets so Properties Panel dropdowns are pre-populated on load
      baseData.onSuccess = step.onSuccess || ''
      baseData.onFailure = step.onFailure || ''
      break
    }
    case 'END': {
      classNames = 'bg-red-50 border-2 border-red-500 rounded-lg shadow-sm text-center p-3 font-medium'
      nodeType = 'output'
      baseData.prompt = step.prompt || ''
      break
    }
  }

  return {
    id: step.id,
    type: nodeType,
    position,
    label: `${step.type}: ${step.id}`,
    class: classNames,
    data: baseData,
  }
}
