
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileText, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getVendorContracts, createVendorContract, type VendorContractFormData } from "@/services/vendorService";
import VendorContractForm from "./VendorContractForm";

interface VendorContractsTabProps {
  vendorId: string;
}

const VendorContractsTab: React.FC<VendorContractsTabProps> = ({ vendorId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["vendor-contracts", vendorId],
    queryFn: () => getVendorContracts(vendorId),
  });

  const createMutation = useMutation({
    mutationFn: createVendorContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-contracts", vendorId] });
      toast.success("Contract created successfully");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create contract");
    },
  });

  const handleCreateContract = (data: Omit<VendorContractFormData, "vendor_id">) => {
    createMutation.mutate({ ...data, vendor_id: vendorId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading contracts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contracts</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <VendorContractForm onSubmit={handleCreateContract} />
          </DialogContent>
        </Dialog>
      </div>

      {contracts && contracts.length > 0 ? (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contract.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{contract.contract_number}</p>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{contract.contract_type}</span>
                  </div>
                  {contract.contract_value && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">${contract.contract_value.toLocaleString()}</span>
                    </div>
                  )}
                  {contract.start_date && contract.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                {contract.description && (
                  <p className="text-sm text-gray-600 mb-3">{contract.description}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No contracts found</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create First Contract</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorContractsTab;
