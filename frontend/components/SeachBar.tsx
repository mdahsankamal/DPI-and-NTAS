import { Search } from "lucide-react"
import React from "react"

type SearchBarProps = {
  placeholder?: string
  className?: string
}

const SearchBar = ({
  placeholder = "Search IP, ports, protocol...",
  className = "",
}: SearchBarProps) => {
  return (
    <div
      className={`flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 transition-colors focus-within:border-ring focus-within:bg-background ${className}`}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />

      <input
        type="search"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

export default SearchBar
