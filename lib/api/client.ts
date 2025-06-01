// lib/api/client.ts
export const updateCompanyStatus = async (
  id: string,
  status: "VERIFIED" | "REJECTED",
  reason: string,
  toast: (props: { type: "success" | "error"; message: string }) => void
) => {
  try {
    const response = await fetch(`/api/clients/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Request failed");
    }

    toast({
      type: "success",
      message: `Company ${status.toLowerCase()} successfully`,
    });

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    toast({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to update company status",
    });
    throw error;
  }
};
