"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
// Assuming these are from your existing UI library
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" 
import { Loader2 } from "lucide-react"

// Assuming a Table component from a UI library like shadcn/ui
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- TYPE DEFINITIONS BASED ON YOUR PRISMA SCHEMA ---

// Type for the statistical chart data
interface StatData {
  employeesByService: { name: string; count: number }[]
  leavesByStatus: { name: string; count: number }[]
  salaryRanges: { name: string; count: number }[]
}

// Minimal types for the new table data, based on your Prisma models
interface EmployeeData {
  id: number
  matricule: string
  nom: string
  prenom: string
  service: string
  poste: string
  salaireBase: number
}

interface LeaveData {
  id: number
  employeName: string // Assuming you'd join to get the name
  dateDebut: string // Using string for DateTimes from API
  dateFin: string
  motif: string
  statut: string
}

interface PayrollData {
  id: number
  employeName: string // Assuming you'd join to get the name
  mois: string
  annee: number
  statut: string
}

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

// --- HELPER COMPONENTS FOR TABLES ---

// Employee Table Component
const EmployeesTable = ({ employees }: { employees: EmployeeData[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Liste des Employés Récents</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matricule</TableHead>
            <TableHead>Nom & Prénom</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Salaire Base</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.slice(0, 5).map((employee) => ( // Limiting to 5 for dashboard
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.matricule}</TableCell>
              <TableCell>{`${employee.nom} ${employee.prenom}`}</TableCell>
              <TableCell>{employee.service}</TableCell>
              <TableCell className="text-right">{employee.salaireBase.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

// Leaves Table Component
const LeavesTable = ({ leaves }: { leaves: LeaveData[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Demandes de Congés Récentes</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            <TableHead>Du</TableHead>
            <TableHead>Au</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.slice(0, 5).map((leave) => ( // Limiting to 5 for dashboard
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{leave.employeName}</TableCell>
              <TableCell>{new Date(leave.dateDebut).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(leave.dateFin).toLocaleDateString()}</TableCell>
              <TableCell>{leave.statut}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

// Payrolls Table Component
const PayrollsTable = ({ payrolls }: { payrolls: PayrollData[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Fiches de Paie Récentes</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.slice(0, 5).map((payroll) => ( // Limiting to 5 for dashboard
            <TableRow key={payroll.id}>
              <TableCell className="font-medium">{payroll.employeName}</TableCell>
              <TableCell>{`${payroll.mois} ${payroll.annee}`}</TableCell>
              <TableCell>{payroll.statut}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

// --- MAIN DASHBOARD COMPONENT ---

export function DashboardContent() {
  const [stats, setStats] = useState<StatData | null>(null)
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [leaves, setLeaves] = useState<LeaveData[]>([])
  const [payrolls, setPayrolls] = useState<PayrollData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch statistical data
        const statsResponse = await fetch("/api/dashboard")
        const statsData = await statsResponse.json()
        setStats(statsData)

        // Fetch Employees data
        const employeesResponse = await fetch("/api/employees")
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json()
          setEmployees(employeesData)
        }
        
        // Fetch Leaves data
        const leavesResponse = await fetch("/api/leaves")
        if (leavesResponse.ok) {
          const leavesData = await leavesResponse.json()
          setLeaves(leavesData)
        }

        // Fetch Payrolls data
        const payrollsResponse = await fetch("/api/payrolls")
        if (payrollsResponse.ok) {
          const payrollsData = await payrollsResponse.json()
          setPayrolls(payrollsData)
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-center text-muted-foreground p-8">Aucune donnée de statistique disponible.</p>
  }

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employés par Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.employeesByService}>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Congés par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.leavesByStatus}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats.leavesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Salaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.salaryRanges}>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* --- Data Tables Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {employees.length > 0 && <EmployeesTable employees={employees} />}
        {leaves.length > 0 && <LeavesTable leaves={leaves} />}
        {payrolls.length > 0 && <PayrollsTable payrolls={payrolls} />}
      </div>
    </div>
  )
}