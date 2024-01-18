import { useEffect, useState, useRef, Fragment } from "react"
import type { Place, State, Region } from "../App"

type DropdownProps = {
  originalPlaces: Region[]
}

const Dropdown = ({ originalPlaces }: DropdownProps) => {
  const scrollRef = useRef<HTMLParagraphElement[]>([])
  const scrollerRef = useRef<HTMLDivElement>(null)

  const [displayPlaces, setDisplayPlacess] = useState(originalPlaces)

  const [selected, setSelected] = useState<Place>({ id: -1, name: '', level: 'county', parent: -1 })
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [searchMode, setSearchMode] = useState(false)

  function filterCounty(val: string): Region[] {
    if (val.length === 0) {
      return originalPlaces
    }

    const newRegions: Region[] = []

    originalPlaces.forEach(region => {

      const newStates: State[] = []
      region.states.forEach(state => {

        const newCounties: Place[] = []
        state.counties.forEach(county => {
          if (county.name.toLowerCase().includes(val)) {
            newCounties.push(county)
          }
        })

        if (newCounties.length === 0) {
          return
        }

        newStates.push({ ...state, counties: newCounties })
      })

      if (newStates.length === 0) {
        return
      }

      newRegions.push({ ...region, states: newStates })
    })

    return newRegions
  }

  useEffect(() => {
    setDisplayPlacess((filterCounty(search)))
  }, [search])

  return (
    <>
      <div className="w-full max-w-[500px]">

        <div className="border flex relative">
          <div className="w-full relative">
            <input
              value={searchMode ? search : selected?.name}
              onBlur={() => {setSearchMode(false); setSearch(''); setOpen(false)}}
              onFocus={() => {
                setOpen(true)
                if (selected.name.length) {
                  const distToScroll = scrollRef.current[selected.id]?.offsetTop
                  console.log(scrollRef.current[selected.id], scrollerRef.current)
                  scrollerRef.current?.scrollTo({top: distToScroll - 300})
                }
              }}
              onKeyDown={() => setSearchMode(true)}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-2 border-r border-gray-500 my-1" placeholder="Please select a county" type="text"
            />
            {selected.name.length > 0 &&
              <svg onMouseDown={() => setSelected({ id: -1, name: '', level: 'county', parent: -1 })} className="absolute right-1 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z" /></svg>
            }
          </div>


          <div className="flex justify-center items-center">
            {!open &&
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m7 10l5 5l5-5z" /></svg>
            }
            {open &&
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m7 15l5-5l5 5z" /></svg>
            }
          </div>

        </div>

          <div ref={scrollerRef} className={`border max-h-[482px] overflow-y-scroll ${open ? "" : "hidden"}`}>
            <div>
              {displayPlaces.map(region => {
                return (
                  <Fragment key={region.id}>
                    <p onMouseDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }} className="px-5 py-1">{region.name}</p>
                    {region.states.map(state => {
                      return (
                        <Fragment key={state.id}>
                          <p onMouseDown={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                          }} className="px-10 py-1">{state.name}</p>
                          {state.counties.map(county => (
                            <p
                              ref={el => {scrollRef.current[county.id] = el}}
                              onMouseDown={() => setSelected(county)}
                              className="hover:bg-blue-100 cursor-pointer px-[60px] py-1"
                              key={county.id}
                            >
                              {county.name}
                            </p>
                          ))}
                        </Fragment>
                      )
                    })}
                  </Fragment>
                )
              })}
            </div>
          </div>
      </div>
    </>
  )

}


export default Dropdown
