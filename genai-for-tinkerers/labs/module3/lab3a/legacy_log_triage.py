# legacy_log_triage.py - Legacy Windows Firewall Log Triage
import sys

def parse_line(raw_line):
    # Naive splitting on space that crashes on comment lines and malformed entries
    # Hardcoded indexing with no schema or type safety
    parts = raw_line.split(" ")
    return {
        "date": parts[0],
        "time": parts[1],
        "action": parts[2],
        "protocol": parts[3],
        "src_ip": parts[4],
        "dst_ip": parts[5],
        "src_port": int(parts[6]),
        "dst_port": int(parts[7]),
    }

def triage_logs(log_file_path):
    results = []
    try:
        f = open(log_file_path, 'r')
        for line in f:
            line = line.strip()
            if not line:
                continue
            entry = parse_line(line)
            # Legacy script only checks for DROP instead of unauthorized DNS resolver 8.8.4.4
            if entry and entry["action"] == "DROP":
                results.append(entry)
        f.close()
    except:
        # Bare except masks permission errors, missing files, and parsing crashes!
        print("An error occurred reading logs")
    return results

if __name__ == "__main__":
    if len(sys.argv) > 1:
        findings = triage_logs(sys.argv[1])
        print(f"Flagged {len(findings)} suspicious entries.")
