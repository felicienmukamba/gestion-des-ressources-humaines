"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Employee {
  id: number;
  nom: string;
  prenom: string;
}

interface AttendanceFormProps {
  attendance?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AttendanceForm({ attendance, onSubmit, onCancel }: AttendanceFormProps) {
  const { data: session } = useSession();
  const isAdminOrRH = session?.user.role.nomRole === "Admin" || session?.user.role.nomRole === "RH";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeId: attendance?.employe.id.toString() || (session?.user.role.nomRole === "Employee" ? session?.user.employee.id.toString() : ""),
    dateJournee: attendance?.dateJournee.split("T")[0] || "",
    heureArrivee: attendance?.heureArrivee ? attendance.heureArrivee.split("T")[1].substring(0, 5) : "",
    heureDepart: attendance?.heureDepart ? attendance.heureDepart.split("T")[1].substring(0, 5) : "",
  });

  useEffect(() => {
    if (isAdminOrRH) {
      fetchEmployees();
    }
  }, [isAdminOrRH]);

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const response = await fetch("/api/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = {
      ...formData,
      employeId: isAdminOrRH ? Number.parseInt(formData.employeId) : session?.user.employee.id,
      dateJournee: new Date(formData.dateJournee).toISOString(),
      heureArrivee: formData.heureArrivee ? `${formData.dateJournee}T${formData.heureArrivee}:00.000Z` : null,
      heureDepart: formData.heureDepart ? `${formData.dateJournee}T${formData.heureDepart}:00.000Z` : null,
    };

    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {isAdminOrRH && (
              <div>
                <Label htmlFor="employeId">Employé</Label>
                <Select value={formData.employeId} onValueChange={(value) => handleChange("employeId", value)}>
                  <SelectTrigger disabled={isLoadingEmployees}>
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {`${employee.prenom} ${employee.nom}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="dateJournee">Date de la journée</Label>
              <Input
                id="dateJournee"
                type="date"
                value={formData.dateJournee}
                onChange={(e) => handleChange("dateJournee", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="heureArrivee">Heure d'arrivée</Label>
              <Input
                id="heureArrivee"
                type="time"
                value={formData.heureArrivee}
                onChange={(e) => handleChange("heureArrivee", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="heureDepart">Heure de départ</Label>
              <Input
                id="heureDepart"
                type="time"
                value={formData.heureDepart}
                onChange={(e) => handleChange("heureDepart", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingEmployees}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {attendance ? "Modification..." : "Création..."}
            </>
          ) : (
            <>{attendance ? "Modifier" : "Créer"}</>
          )}
        </Button>
      </div>
    </form>
  );
}