import { useEffect, useState } from 'react'
import Dropdown from './components/Dropdown'

export interface Place {
  id: number
  name: string
  level: "region" | "state" | "county"
  parent: number | null
}

export interface Region extends Place {
  states: State[]
}
export interface State extends Place {
  counties: Place[]
}


function orderPlaces(placeArr: Place[]): Region[] {
  const regions: Region[] = []
  const states = placeArr.filter(place => place.level === "state")

  placeArr.filter(place => place.level === "region")
    .forEach(r => {
      const region = {
        ...r,
        states: states.filter(state => state.parent === r.id).map(state => ({
          ...state,
          counties: placeArr.filter(place => place.level === "county" && place.parent === state.id)
        }))
      }

      regions.push(region)
    })

  return regions
}

function App() {
  const [places, setPlaces] = useState<Region[] | null>(null)
  useEffect(() => {
    fetch("https://gist.githubusercontent.com/bleonard33/38a183289ed87082fed7b2547f2eea49/raw/3290b8ea9791c4e632520a9e1849f580bb82346a/census_classification.json")
      .then(res => res.json().then(data => setPlaces(orderPlaces(data))))
  }, [])



  return (
    <>
      <div className='flex justify-center pt-40 h-screen'>
        {places &&
          <Dropdown originalPlaces={places} />
        }
      </div>
    </>
  )
}

export default App
