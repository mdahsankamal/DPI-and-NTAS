"use client"

import React, { useRef, useState } from "react"
import axios from "axios"
import { SidebarTrigger } from "./ui/sidebar"
import SeachBar from "./SeachBar"
import { Button } from "./ui/button"
import api from "@/api/axios"

const Header = () => {
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  const loadCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploading(true)
    setMessage("")

    try {
      const response = await api.post("/pcap", file, {
        headers: { "Content-Type": "application/octet-stream" },
      })
      setMessage(`Loaded ${response.data.packetCount} packets`)
      window.dispatchEvent(new Event("pcap-loaded"))
    } catch (error) {
      const detail = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error ?? error.message
        : error instanceof Error
          ? error.message
          : "Upload failed"
      setMessage(`Could not load capture: ${detail}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <header className="flex h-16 w-full items-center border-b border-border px-4">
      <SidebarTrigger />

      <div className="ml-3 flex min-w-0 flex-1 items-center justify-between gap-6">
        <div className="flex shrink-0 flex-col">
          <span className="text-sm font-semibold tracking-tight">Network</span>

          <span className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground">
            DEEP PACKET INSPECTION
          </span>
        </div>

        <SeachBar className="hidden md:flex" />

        <div className="flex items-center gap-3">
          <span
            className="text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {message}
          </span>
          <input
            ref={fileInput}
            className="hidden"
            type="file"
            accept=".pcap,.pcapng,application/vnd.tcpdump.pcap,application/x-pcapng"
            onChange={loadCapture}
          />
          <Button
            type="button"
            className="cursor-pointer"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
          >
            {uploading ? "LOADING..." : "LOAD PCAP"}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
