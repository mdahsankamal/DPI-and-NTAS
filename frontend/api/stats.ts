import api from "./axios"

export const getPackets = async () => {
  const response = await api.get("/packets")
  return response
}
