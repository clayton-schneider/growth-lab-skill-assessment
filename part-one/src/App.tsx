import { MouseEvent, useEffect, useState, useRef } from 'react'
import * as d3 from "d3"
import './App.css'

interface Node {
  productId: string
  x: number
  y: number
  name?: string
  code?: string
  sectorId?: string
}

interface Edge {
  source: string
  target: string
}

interface NodeAndEdgeResponse {
  nodes: Node[]
  edges: Edge[]
}

interface Metadata {
  productId: string
  productName: string
  productCode: string
  productSector: {
    productId: string
  }
}

function App() {
  const [nodes, setNodes] = useState<Node[] | null>(null)
  const WIDTH = 1200
  const HEIGHT = 800
  const PADDING = 20

  const tooltipRef = useRef<HTMLDivElement>(null)

  const colorMap = new Map([
    ['product-HS92-1', 'rgb(125, 218, 161)'],
    ['product-HS92-2', '#F5CF23'],
    ['product-HS92-3', 'rgb(218, 180, 125)'],
    ['product-HS92-4', 'rgb(187, 150, 138)'],
    ['product-HS92-5', 'rgb(217, 123, 123)'],
    ['product-HS92-6', 'rgb(197, 123, 217)'],
    ['product-HS92-7', 'rgb(141, 123, 216)'],
    ['product-HS92-8', 'rgb(123, 162, 217)'],
    ['product-HS92-9', 'rgb(125, 218, 218)'],
    ['product-HS92-10', '#2a607c'],
    ['product-HS92-14', 'rgb(178, 61, 109)'],
  ]);

  useEffect(() => {
    const fetchMeta = async (): Promise<Metadata[] | null> => {
      try {
        return await fetch("metadata.json").then(res => res.json().then(data => data["productHs92"]))
      } catch (err) {
        console.log("Error fetching metadata")
        return null
      }
    }

    const fetchNodesAndEdges = async (): Promise<NodeAndEdgeResponse | null> => {
      try {
        return await fetch("node-edges.json").then(res => res.json().then(nodesAndEdges => nodesAndEdges))
      } catch (err) {
        console.log("Error fetching nodes and edges")
        return null
      }
    }
    const setupApp = async () => {
      const metadata = await fetchMeta()
      const nAndE = await fetchNodesAndEdges()
      const nodes = nAndE!.nodes.filter((n: Node) => n.x).map(node => {
        metadata!.forEach(m => {
          if (m.productId === node.productId) {
            node.code = m.productCode
            node.name = m.productName
            node.sectorId = m.productSector.productId
          }
        })

        return node
      })


      const maxX = Math.max(...nodes!.map(n => n.x))
      const minX = Math.min(...nodes!.map(n => n.x))
      const maxY = Math.max(...nodes!.map(n => n.y))
      const minY = Math.min(...nodes!.map(n => n.y))

      const xScale = d3.scaleLinear().domain([minX, maxX]).range([PADDING, WIDTH - PADDING])
      const yScale = d3.scaleLinear().domain([minY, maxY]).range([PADDING, HEIGHT - PADDING])

      setNodes(nodes.map(n => ({ ...n, x: xScale(n.x), y: yScale(n.y) })))
    }

    setupApp()

  }, [])

  const [hovered, setHovered] = useState<Node | null>(null)

  const handleHover = (e: MouseEvent, node: Node | null) => {
    setHovered(node)
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate(${e.clientX+20}px, ${e.clientY+20}px)`
    }
  }

  return (
    <>
      <div>
        <div
          ref={tooltipRef}
          className={`${hovered ? "visible" : "invisible"} absolute p-1 bg-green-900 text-white`}>
          {hovered ? `${hovered?.name} (${hovered.code})` : ""}
        </div>
        <svg className='bg-blue-50' width={WIDTH} height={HEIGHT}>
          {nodes?.map(node => (
            <circle
              onMouseLeave={e => handleHover(e, null)}
              onMouseOver={e => handleHover(e, node)}
              className='hover:cursor-pointer hover:stroke-[3px] hover:stroke-red-500 stroke-1'
              key={node.productId}
              fill={colorMap.get(node.sectorId!)}
              stroke="#CCCCCC"
              cx={node.x} cy={node.y} r={4} />
          ))}
        </svg>

      </div>
    </>
  )
}

export default App
