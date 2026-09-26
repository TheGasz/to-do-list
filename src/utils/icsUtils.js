/**
 * Utility untuk mem-parsing file .ics dari Moodle (Elok UGM)
 */

// Parse baris ICS (handle multiline/folded lines jika perlu)
function parseICS(icsText) {
  const lines = icsText.split(/\r?\n/);
  const events = [];
  let currentEvent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === "BEGIN:VEVENT") {
      currentEvent = {};
    } else if (line === "END:VEVENT") {
      if (currentEvent && currentEvent.summary && currentEvent.dtstart) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith("SUMMARY:")) {
        currentEvent.summary = line.substring(8).trim();
      } else if (line.startsWith("DTSTART")) {
        // Format: DTSTART:20231120T170000Z atau DTSTART;VALUE=DATE:20231120
        const parts = line.split(":");
        if (parts.length > 1) {
          currentEvent.dtstart = parts[1].trim();
        }
      } else if (line.startsWith("CATEGORIES:")) {
        currentEvent.categories = line.substring(11).trim();
      }
    }
  }

  return events;
}

// Convert format tanggal ICS (YYYYMMDDTHHmmssZ) ke ISO string (YYYY-MM-DDTHH:mm)
function parseICSDate(icsDateStr) {
  if (!icsDateStr) return null;
  
  // Format standard: 20231120T170000Z
  const match = icsDateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (match) {
    const [_, y, m, d, h, min, s, z] = match;
    const dateStr = `${y}-${m}-${d}T${h}:${min}:${s}${z ? 'Z' : ''}`;
    const date = new Date(dateStr);
    
    // Convert to local time string suitable for input[type="datetime-local"] (YYYY-MM-DDTHH:mm)
    const local = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return local.toISOString().slice(0, 16);
  }
  
  // Format date only: 20231120
  const dateMatch = icsDateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateMatch) {
    const [_, y, m, d] = dateMatch;
    return `${y}-${m}-${d}T23:59`; // Asumsikan end of day jika cuma tanggal
  }
  
  return null;
}

export async function fetchAndParseElokICS(url) {
  try {
    // Gunakan allorigins.win sebagai fallback CORS proxy yang lebih stabil
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data kalender. HTTP Status: ${response.status}`);
    }
    
    const icsText = await response.text();
    if (!icsText.includes("BEGIN:VCALENDAR")) {
      throw new Error("Format file tidak valid atau URL salah. Pastikan URL langsung mengarah ke file .ics.");
    }

    const events = parseICS(icsText);
    
    const tasks = [];
    const now = new Date();
    
    for (const event of events) {
      const deadline = parseICSDate(event.dtstart);
      if (!deadline) continue;
      
      const deadlineDate = new Date(deadline);
      
      // Hanya ambil tugas yang deadlinenya belum lewat
      if (deadlineDate >= now) {
        // Bersihkan summary: biasanya format Moodle "Nama Matkul: Nama Tugas" atau sejenisnya
        // Contoh: "Course name: Assignment name is due" -> kita ambil apa adanya dulu
        let text = event.summary;
        // Hapus teks " is due" jika ada (bawaan moodle calendar)
        text = text.replace(/ is due$/, "");
        
        tasks.push({
          text: text.trim(),
          deadline: deadline,
          source: "elok",
          category: "📚 Tugas",
        });
      }
    }
    
    return tasks;
  } catch (error) {
    console.error("Error fetching ICS:", error);
    throw new Error("Gagal mengambil atau membaca kalender Elok. Pastikan URL valid.");
  }
}
