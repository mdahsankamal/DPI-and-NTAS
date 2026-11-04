cmake_minimum_required(VERSION 3.16)

project(PacketAnalyzer VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Header files

include_directories(${CMAKE_SOURCE_DIR}/include)

# Thread support

find_package(Threads REQUIRED)

# Common DPI source files

set(DPI_COMMON_SOURCES
src/pcap_reader.cpp
src/packet_parser.cpp
src/sni_extractor.cpp
src/types.cpp
src/connection_tracker.cpp
src/rule_manager.cpp
src/fast_path.cpp
src/load_balancer.cpp
src/dpi_engine.cpp
)

# Basic Packet Analyzer

add_executable(packet_analyzer
src/main.cpp
src/pcap_reader.cpp
src/packet_parser.cpp
)

# Full Multithreaded DPI Engine

add_executable(dpi_engine_mt
src/dpi_mt.cpp
${DPI_COMMON_SOURCES}
)

target_link_libraries(dpi_engine_mt PRIVATE Threads::Threads)

# Compiler warnings

if(MSVC)
target_compile_options(packet_analyzer PRIVATE /W4)
target_compile_options(dpi_engine_mt PRIVATE /W4)
else()
target_compile_options(packet_analyzer PRIVATE -Wall -Wextra)
target_compile_options(dpi_engine_mt PRIVATE -Wall -Wextra)
endif()
