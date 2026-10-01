import { jsPDF } from "jspdf";
import type { ConvidadoConfirmado } from "@/services/confirmacaoPresencaService";

type GuestGroup = { name: string; companions: string[] };

function prepareGroups(guests: ConvidadoConfirmado[]): GuestGroup[] {
  const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });

  return guests
    .map((guest) => ({
      name: guest.nome_convidado.trim(),
      companions: (guest.nomes_acompanhantes ?? [])
        .map((name) => name.trim())
        .filter(Boolean)
        .sort(collator.compare),
    }))
    .filter((guest) => guest.name)
    .sort((a, b) => collator.compare(a.name, b.name));
}

export function gerarListaConvidadosPdf(guests: ConvidadoConfirmado[]) {
  const groups = prepareGroups(guests);
  const totalPeople = groups.reduce((total, group) => total + 1 + group.companions.length, 0);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const left = 19;
  const right = pageWidth - left;
  const bottom = pageHeight - 20;
  let y = 0;

  function drawHeader() {
    pdf.setFillColor(247, 246, 240);
    pdf.rect(0, 0, pageWidth, 53, "F");
    pdf.setTextColor(77, 88, 62);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("MURILO & MIRELLE", left, 18);
    pdf.setTextColor(43, 49, 39);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("Lista de convidados", left, 31);
    pdf.setFontSize(10);
    pdf.text(`${totalPeople} pessoas confirmadas`, left, 42);
    pdf.setDrawColor(189, 193, 175);
    pdf.line(left, 53, right, 53);
    y = 64;
  }

  function nextPage() {
    pdf.addPage();
    drawHeader();
  }

  drawHeader();

  for (const [index, group] of groups.entries()) {
    const nameLines = pdf.splitTextToSize(group.name, right - left - 22) as string[];
    const companionLines = group.companions.flatMap(
      (name) => pdf.splitTextToSize(name, right - left - 30) as string[],
    );
    const blockHeight = 12 + nameLines.length * 5.5 + companionLines.length * 5 + 5;

    if (y + blockHeight > bottom) nextPage();

    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 247);
      pdf.roundedRect(left - 3, y - 5, right - left + 6, blockHeight, 2, 2, "F");
    }

    pdf.setTextColor(112, 120, 99);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(String(index + 1).padStart(3, "0"), left, y + 1);
    pdf.setTextColor(43, 49, 39);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(nameLines, left + 18, y + 1);
    y += nameLines.length * 5.5 + 4;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(85, 91, 78);
    for (const companion of group.companions) {
      const lines = pdf.splitTextToSize(companion, right - left - 30) as string[];
      pdf.text(lines, left + 25, y + 1);
      y += lines.length * 5;
    }
    y += 12;
  }

  if (groups.length === 0) {
    pdf.setTextColor(85, 91, 78);
    pdf.setFontSize(11);
    pdf.text("Nenhuma presença confirmada até o momento.", left, y);
  }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setDrawColor(218, 220, 211);
    pdf.line(left, pageHeight - 17, right, pageHeight - 17);
    pdf.setTextColor(112, 120, 99);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(`Página ${page} de ${pageCount}`, right, pageHeight - 11, { align: "right" });
  }

  pdf.save("lista-convidados-confirmados.pdf");
}
