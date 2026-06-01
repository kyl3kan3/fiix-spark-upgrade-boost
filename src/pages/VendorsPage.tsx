
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MaterialIcon from "@/components/ui/material-icon";
import { getAllVendors, deleteVendor } from "@/services/vendorService";

const VendorsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
  });
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Categories");

  const queryClient = useQueryClient();
  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: getAllVendors,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted");
    },
    onError: (err: any) => {
      toast.error("Failed to delete vendor", { description: err?.message });
    },
  });

  const statusOptions = ["active", "inactive", "pending"];
  const typeOptions = ["supplier", "contractor", "service", "maintenance"];

  const filteredVendors = vendors.filter((vendor: any) => {
    const matchesSearch =
      !filters.search ||
      vendor.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(vendor.status);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(vendor.vendor_type);
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleSelection = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSelectAll = () => {
    setSelectedVendors(vendors.map((v: any) => v.id));
  };

  const handleClearSelection = () => {
    setSelectedVendors([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-success/10 text-success uppercase tracking-wide">Active</span>;
      case "preferred":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed-variant uppercase tracking-wide">Preferred</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant uppercase tracking-wide">{status || "Inactive"}</span>;
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "hvac": return "ac_unit";
      case "electrical": return "electric_bolt";
      case "plumbing": return "plumbing";
      case "security": return "security";
      default: return "handyman";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const CATEGORIES = ["All Categories", "HVAC", "Electrical", "Plumbing"];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Vendors & Contractors | MaintenEase</title>
        <meta name="description" content="Manage maintenance vendors and contractors — contact info, service categories, and work history in one place." />
        <link rel="canonical" href="https://maintenease.com/vendors" />
        <meta property="og:title" content="Vendors & Contractors | MaintenEase" />
        <meta property="og:description" content="Manage maintenance vendors and contractors in one place." />
        <meta property="og:url" content="https://maintenease.com/vendors" />
      </Helmet>

      <div className="flex-1 p-4 md:p-container_padding flex flex-col gap-6">
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">Vendors Directory</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage external service providers and contractors.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link to="/vendors/import" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container hover:text-primary transition-colors bg-surface-container-lowest">
              <MaterialIcon name="upload" className="text-[18px]" />
              Import
            </Link>
            <Link to="/vendors/new" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md uppercase tracking-wider rounded-lg hover:bg-primary-container shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all">
              <MaterialIcon name="add" className="text-[18px]" />
              New Vendor
            </Link>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-surface-container-lowest rounded-lg p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              className="w-full bg-surface-container-low text-on-surface border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary"
              placeholder="Search vendors..."
              type="text"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors"
                    : "px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container transition-colors"
                }
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="ml-auto flex items-center gap-2 text-primary font-label-md text-label-md hover:underline">
            <MaterialIcon name="filter_list" className="text-[18px]" />
            More Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-surface-container-lowest rounded-lg shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Contact Person</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Service</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor: any) => (
                    <tr key={vendor.id} className="hover:bg-surface-container/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary font-headline-md">
                            {(vendor.name || "V").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">{vendor.name}</div>
                            <div className="font-body-md text-[13px] text-on-surface-variant">Contract ID: #{vendor.id?.slice(0, 8) || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <MaterialIcon name={getCategoryIcon(vendor.vendor_type)} className="text-[18px]" />
                          <span className="font-body-md text-body-md capitalize">{vendor.vendor_type || "General"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface">{vendor.contact_name || "—"}</span>
                          <span className="font-body-md text-[13px] text-outline">{vendor.email || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(vendor.status)}
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                        {vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-outline hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container"
                          onClick={() => deleteMutation.mutate(vendor.id)}
                        >
                          <MaterialIcon name="more_vert" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Mockup sample rows when no real data */
                  <>
                    <tr className="hover:bg-surface-container/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary font-headline-md">A</div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">Apex Air Systems</div>
                            <div className="font-body-md text-[13px] text-on-surface-variant">Contract ID: #V-4092</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <MaterialIcon name="ac_unit" className="text-[18px]" />
                          <span className="font-body-md text-body-md">HVAC</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface">Sarah Jenkins</span>
                          <span className="font-body-md text-[13px] text-outline">s.jenkins@apexair.com</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed-variant uppercase tracking-wide">Preferred</span>
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Oct 12, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-outline hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container">
                          <MaterialIcon name="more_vert" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary font-headline-md">V</div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">Volt Dynamics</div>
                            <div className="font-body-md text-[13px] text-on-surface-variant">Contract ID: #V-1104</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <MaterialIcon name="electric_bolt" className="text-[18px]" />
                          <span className="font-body-md text-body-md">Electrical</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface">Marcus Reed</span>
                          <span className="font-body-md text-[13px] text-outline">m.reed@voltdynamics.co</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-success/10 text-success uppercase tracking-wide">Active</span>
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Nov 05, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-outline hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container">
                          <MaterialIcon name="more_vert" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary font-headline-md">C</div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">ClearFlow Plumbing</div>
                            <div className="font-body-md text-[13px] text-on-surface-variant">Contract ID: #V-8832</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <MaterialIcon name="plumbing" className="text-[18px]" />
                          <span className="font-body-md text-body-md">Plumbing</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface">David Chen</span>
                          <span className="font-body-md text-[13px] text-outline">dispatch@clearflow.net</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant uppercase tracking-wide">Inactive</span>
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Jan 14, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-outline hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container">
                          <MaterialIcon name="more_vert" />
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-primary font-headline-md">S</div>
                          <div>
                            <div className="font-label-md text-label-md text-on-surface">Sentinel Security</div>
                            <div className="font-body-md text-[13px] text-on-surface-variant">Contract ID: #V-2211</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <MaterialIcon name="security" className="text-[18px]" />
                          <span className="font-body-md text-body-md">Facility Services</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface">Elena Rostova</span>
                          <span className="font-body-md text-[13px] text-outline">erostova@sentinel.com</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-success/10 text-success uppercase tracking-wide">Active</span>
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Dec 01, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-outline hover:text-primary transition-colors p-1 rounded-md hover:bg-surface-container">
                          <MaterialIcon name="more_vert" />
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-lowest flex items-center justify-between">
            <span className="font-body-md text-sm text-on-surface-variant">
              Showing 1 to {Math.min(filteredVendors.length || 4, 4)} of {filteredVendors.length || 48} entries
            </span>
            <div className="flex gap-1">
              <button className="p-1 rounded-md text-outline hover:bg-surface-container hover:text-primary transition-colors" disabled>
                <MaterialIcon name="chevron_left" className="text-[20px]" />
              </button>
              <button className="w-8 h-8 rounded-md bg-primary/10 text-primary font-label-md flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container font-label-md flex items-center justify-center transition-colors">2</button>
              <button className="w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container font-label-md flex items-center justify-center transition-colors">3</button>
              <span className="w-8 h-8 flex items-center justify-center text-outline">...</span>
              <button className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                <MaterialIcon name="chevron_right" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </DashboardLayout>
  );
};

export default VendorsPage;
