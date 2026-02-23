import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useParams } from "react-router-dom"
import { occupancyApiService } from "@/services/spaces_sites/spaceoccupancyapi"

export default function InspectionDetails() {
  const { inspectionId } = useParams()

  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    walls_condition: "",
    floor_condition: "",
    electrical_condition: "",
    plumbing_condition: "",
    accessories_returned: false,
    damage_notes: ""
  })

  useEffect(() => {
    fetchInspection()
  }, [])

  const fetchInspection = async () => {
    const res = await occupancyApiService.fetchInspection(inspectionId)
    setInspection(res.data)
    setLoading(false)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      <Card>
        <CardHeader>
          <CardTitle>Space Inspection</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Walls */}
          <div>
            <p className="text-sm font-medium">Walls Condition</p>
            <Select
              value={form.walls_condition}
              onValueChange={(value) =>
                setForm({ ...form, walls_condition: value })
              }
            >
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="minor_damage">Minor Damage</SelectItem>
              <SelectItem value="major_damage">Major Damage</SelectItem>
            </Select>
          </div>

          {/* Floor */}
          <div>
            <p className="text-sm font-medium">Floor Condition</p>
            <Select
              value={form.floor_condition}
              onValueChange={(value) =>
                setForm({ ...form, floor_condition: value })
              }
            >
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </Select>
          </div>

          {/* Electrical */}
          <div>
            <p className="text-sm font-medium">Electrical</p>
            <Select
              value={form.electrical_condition}
              onValueChange={(value) =>
                setForm({ ...form, electrical_condition: value })
              }
            >
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="not_working">Not Working</SelectItem>
            </Select>
          </div>

          {/* Plumbing */}
          <div>
            <p className="text-sm font-medium">Plumbing</p>
            <Select
              value={form.plumbing_condition}
              onValueChange={(value) =>
                setForm({ ...form, plumbing_condition: value })
              }
            >
              <SelectItem value="working">Working</SelectItem>
              <SelectItem value="leak">Leak</SelectItem>
            </Select>
          </div>

          {/* Accessories */}
          {/* <div className="flex items-center gap-2">
            <Checkbox
              checked={form.accessories_returned}
              onCheckedChange={(value) =>
                setForm({ ...form, accessories_returned: value })
              }
            />
            <p className="text-sm">Accessories Returned</p>
          </div> */}

          {/* Damage Notes */}
          <div>
            <p className="text-sm font-medium">Damage Notes</p>
            <Textarea
              value={form.damage_notes}
              onChange={(e) =>
                setForm({ ...form, damage_notes: e.target.value })
              }
            />
          </div>

          <Button >Complete Inspection</Button>

        </CardContent>
      </Card>
    </div>
  )
}