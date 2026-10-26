import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "/Users/winnerkorea/Desktop/Project/Embeded_HW";
const buildDir = path.join(workspaceDir, "ppt_build");
const assetDir = path.join(buildDir, "assets");
const previewDir = path.join(buildDir, "previews");
const outputDir = path.join(workspaceDir, "output", "pptx");
const skillDir = "/Users/winnerkorea/.codex/plugins/cache/openai-primary-runtime/presentations/26.1007.11041/skills/presentations";
const pythonExecutable = "/Users/winnerkorea/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
const sourcePdf = "/Users/winnerkorea/Downloads/Embedded Hardware_ Know It All ( PDFDrive ).pdf";
const font = "Apple SD Gothic Neo";
const colors = { ink: "#18212B", muted: "#5B6875", blue: "#176B9B", pale: "#EAF3F8", line: "#D7E0E7", white: "#FFFFFF", soft: "#F5F7F9" };

const requiredPages = [290, 299, 306, 319, 326, 329, 363, 366, 370, 396, 400, 413, 416, 417, 420, 423, 427, 430, 436, 439, 450];
const assetBytes = new Map();
for (const page of requiredPages) {
  assetBytes.set(page, await fs.readFile(path.join(assetDir, `p${page}.png`)));
}

const { finalizePresentation, makeNativeBulletParagraphs } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);

await fs.mkdir(previewDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(path.join(buildDir, "finalizer"), { recursive: true });

function addText(slide, text, pos, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: pos,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: font,
    fontSize: opts.fontSize ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? colors.ink,
    autoFit: "none",
    verticalAlignment: opts.verticalAlignment ?? "top",
    textAlign: opts.textAlign ?? "left",
  };
  shape.text.insets = opts.insets ?? 0;
  return shape;
}

function addBullets(slide, items, pos, opts = {}) {
  const shape = slide.shapes.add({ geometry: "textbox", position: pos, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  shape.text = makeNativeBulletParagraphs(items, { marginLeftPoints: 18, hangingPoints: 9, spaceAfterPoints: opts.spaceAfter ?? 7 });
  shape.text.style = { typeface: font, fontSize: opts.fontSize ?? 19, color: opts.color ?? colors.ink, autoFit: "none" };
  shape.text.insets = 0;
  return shape;
}

function baseSlide(pres, chapter, number, pageNote) {
  const slide = pres.slides.add();
  slide.background.fill = colors.white;
  slide.shapes.add({ geometry: "rect", position: { left: 42, top: 48, width: 7, height: 624 }, fill: colors.blue, line: { style: "solid", fill: "none", width: 0 } });
  addText(slide, `${chapter}  ${String(number).padStart(2, "0")}`, { left: 74, top: 672, width: 180, height: 22 }, { fontSize: 12, color: colors.muted });
  addText(slide, "Embedded Hardware: Know It All", { left: 930, top: 672, width: 280, height: 22 }, { fontSize: 11, color: colors.muted, textAlign: "right" });
  slide.speakerNotes.text = `출처: ${sourcePdf}\n${pageNote}`;
  slide.speakerNotes.setVisible(false);
  return slide;
}

function addLead(slide, text, left = 78, top = 58, width = 530, height = 92) {
  return addText(slide, text, { left, top, width, height }, { fontSize: 27, bold: true, color: colors.blue });
}

function addImage(slide, page, pos, crop, alt) {
  return slide.images.add({ blob: assetBytes.get(page), contentType: "image/png", alt, fit: "contain", position: pos, crop: crop ?? { left: 0, top: 0, right: 0, bottom: 0 } });
}

function addImageFrame(slide, pos) {
  slide.shapes.add({ geometry: "rect", position: pos, fill: colors.white, line: { style: "solid", fill: colors.line, width: 1 } });
}

function addCaption(slide, text, pos) {
  addText(slide, text, pos, { fontSize: 13, color: colors.muted, textAlign: "center" });
}

function styleTable(table, headerRows = 1) {
  table.borders.assign({ style: "solid", fill: colors.line, width: 1 });
  const all = table.cells.block({ row: 0, column: 0, rowCount: table.rows.length, columnCount: table.columns.length });
  all.textStyle.typeface = font;
  all.textStyle.fontSize = 15;
  all.textStyle.color = colors.ink;
  all.margins = { left: 8, right: 8, top: 6, bottom: 6 };
  for (let r = 0; r < headerRows; r++) {
    const range = table.cells.block({ row: r, column: 0, rowCount: 1, columnCount: table.columns.length });
    range.fill = colors.pale;
    range.textStyle.bold = true;
    range.textStyle.color = colors.blue;
  }
}

function makeDeck() {
  return Presentation.create({ slideSize: { width: 1280, height: 720 } });
}

function buildChapter7() {
  const p = makeDeck();
  let s;

  s = baseSlide(p, "CHAPTER 7", 1, "Chapter 7, pp. 273-300");
  addLead(s, "MCU 선택은 사양표 한 줄이 아니라 제품의 전체 개발 조건을 결정한다");
  addBullets(s, [
    "필요한 주변장치와 성능을 충족하는지 먼저 확인한다.",
    "소량 구매, 데이터시트 공개, 평가보드 가격과 기술지원까지 함께 본다.",
    "현재 가격보다 장기 공급 가능성과 다른 부품으로의 이식성을 중요하게 평가한다.",
    "완벽한 부품을 찾는 데 시간을 쓰기보다 일정 안에 구현 가능한 선택을 내린다.",
  ], { left: 80, top: 180, width: 525, height: 360 }, { fontSize: 21, spaceAfter: 12 });
  addImageFrame(s, { left: 690, top: 70, width: 470, height: 555 });
  addImage(s, 290, { left: 705, top: 82, width: 440, height: 520 }, { left: 0.02, top: 0.04, right: 0.02, bottom: 0.02 }, "Chapter 7 opening page");

  s = baseSlide(p, "CHAPTER 7", 2, "Chapter 7, pp. 273-276");
  addLead(s, "후보 부품은 기술 사양과 공급 위험을 같은 비중으로 걸러낸다");
  addBullets(s, [
    "주요 유통사에서 단품 주문이 가능하면 시제품과 유지보수가 쉬워진다.",
    "데이터시트와 회로 정보가 NDA 없이 제공되어야 독립적으로 문제를 해결할 수 있다.",
    "저가 개발 보드와 제조사 기술 담당자의 존재는 초기 시행착오를 줄인다.",
    "OEM 공급 실적과 실제 상용 제품의 채택 여부는 단종 위험을 판단하는 단서다.",
    "GNU 툴체인 지원은 컴파일러 비용과 특정 업체 종속을 낮춘다.",
  ], { left: 82, top: 170, width: 1110, height: 380 }, { fontSize: 22, spaceAfter: 14 });
  addText(s, "선택 목표: 최고의 부품보다 끝까지 개발하고 생산할 수 있는 부품", { left: 82, top: 580, width: 1080, height: 54 }, { fontSize: 23, bold: true, color: colors.blue, textAlign: "center" });

  s = baseSlide(p, "CHAPTER 7", 3, "Chapter 7, pp. 276-281");
  addLead(s, "코어 선택은 성능뿐 아니라 이식성, 전력, 개발비의 균형 문제다", 78, 48, 1120, 55);
  const t7 = s.tables.add({ rows: 5, columns: 4, left: 80, top: 125, width: 1100, height: 390, values: [
    ["코어", "주요 장점", "주의점", "적합한 상황"],
    ["x86", "운영체제와 드라이버가 풍부함", "전력·발열·복잡한 부트 구조", "소량 제품, 기능 시제품"],
    ["MIPS / SuperH", "검증된 RISC 생태계", "저가 보드와 소량 부품 확보가 어려움", "해당 칩셋이 요구되는 제품"],
    ["PowerPC", "높은 성능", "보드와 개발환경 비용이 큼", "고성능 산업용 시스템"],
    ["ARM", "저전력, 다양한 공급사와 SoC", "제품별 주변장치 차이는 확인 필요", "범용 32비트 임베디드"],
  ] });
  styleTable(t7);
  addText(s, "책은 대중적인 코어를 선택하면 특정 MCU가 단종되어도 포팅 부담을 줄일 수 있다고 설명한다.", { left: 100, top: 548, width: 1060, height: 70 }, { fontSize: 21, color: colors.muted, textAlign: "center" });

  s = baseSlide(p, "CHAPTER 7", 4, "Chapter 7, pp. 281-282");
  addLead(s, "구하기 어려운 전용 칩의 기능은 FPGA에서 필요한 만큼 구현할 수 있다");
  addBullets(s, [
    "UART, 메모리 컨트롤러, 영상 처리기와 같은 사용자 정의 주변장치를 만든다.",
    "범용 FPGA는 전용 ASSP보다 소량 구매와 설계 변경이 쉽다.",
    "무료 HDL 도구와 공개 코어를 활용하면 개발비를 줄일 수 있다.",
    "이미 FPGA가 필요한 시스템이라면 남는 논리와 I/O를 다른 기능에 활용할 수 있다.",
  ], { left: 80, top: 175, width: 575, height: 365 }, { fontSize: 21, spaceAfter: 13 });
  addImageFrame(s, { left: 710, top: 130, width: 430, height: 420 });
  addImage(s, 299, { left: 725, top: 145, width: 400, height: 390 }, { left: 0.02, top: 0.15, right: 0.02, bottom: 0.25 }, "Chapter 7 FPGA discussion page");
  addCaption(s, "FPGA는 기능을 직접 합성할 수 있지만 HDL 설계 역량과 검증 비용이 필요하다.", { left: 700, top: 565, width: 450, height: 55 });

  s = baseSlide(p, "CHAPTER 7", 5, "Chapter 7, pp. 282-285");
  addLead(s, "개발 보드는 팀 규모와 최종 하드웨어의 차이를 기준으로 선택한다");
  addBullets(s, [
    "평가보드: 검증된 하드웨어에서 펌웨어를 먼저 개발할 수 있지만 가격과 확장 제약이 있다.",
    "기존 제품 재활용: 일회성 시제품에 유리하지만 메모리맵과 부트 방식을 역설계해야 한다.",
    "자체 PCB: 최종 제품과 같은 조건에서 개발할 수 있지만 보드 오류가 소프트웨어 일정까지 멈춘다.",
    "필요 기능을 평가보드에 연결하기 어렵다면 자체 PCB가 오히려 효율적일 수 있다.",
  ], { left: 80, top: 170, width: 1100, height: 385 }, { fontSize: 22, spaceAfter: 14 });
  addText(s, "하드웨어와 펌웨어를 동시에 디버깅하는 방식은 자유도가 높지만 첫 PCB 검토가 특히 중요하다.", { left: 95, top: 575, width: 1070, height: 56 }, { fontSize: 21, bold: true, color: colors.blue, textAlign: "center" });

  s = baseSlide(p, "CHAPTER 7", 6, "Chapter 7, pp. 285-286");
  addLead(s, "기본 계측기는 고가 장비보다 자주 사용되고 설계 문제를 직접 보여준다");
  addBullets(s, [
    "멀티미터는 전압, 저항과 전원 단락을 가장 먼저 확인하는 도구다.",
    "오실로스코프는 충분한 대역폭과 다양한 트리거 기능을 우선한다.",
    "전류 제한형 전원공급기는 새 보드의 과전류 손상을 줄인다.",
    "확대경과 온도조절 인두는 표면실장 부품 작업의 기본 장비다.",
    "PC용 저가 오실로스코프는 제한된 ADC 성능 때문에 신호를 잘못 보여줄 수 있다.",
  ], { left: 80, top: 170, width: 1100, height: 400 }, { fontSize: 22, spaceAfter: 12 });

  s = baseSlide(p, "CHAPTER 7", 7, "Chapter 7, pp. 286-289, Figure 7.1");
  addLead(s, "32비트 개발은 고수준 언어와 JTAG 중심의 디버깅 흐름을 사용한다");
  addBullets(s, [
    "캐시와 파이프라인 때문에 전체 코드를 어셈블리로 수동 최적화하기 어렵다.",
    "컴파일러 최적화를 우선 적용하고 프로파일링으로 확인된 병목만 수정한다.",
    "JTAG은 CPU를 정지하고 레지스터, 메모리와 주변장치 상태를 직접 확인한다.",
    "빈 Flash가 장착된 새 보드에도 초기 코드를 기록할 수 있다.",
  ], { left: 78, top: 175, width: 550, height: 360 }, { fontSize: 20, spaceAfter: 12 });
  addImageFrame(s, { left: 680, top: 95, width: 500, height: 500 });
  addImage(s, 306, { left: 695, top: 110, width: 470, height: 450 }, { left: 0.12, top: 0.14, right: 0.12, bottom: 0.50 }, "Macraigor JTAG Wiggler");
  addCaption(s, "Figure 7.1. JTAG Wiggler는 프로세서 상태와 하드웨어 레지스터를 직접 다루는 디버거다.", { left: 690, top: 565, width: 480, height: 48 });

  s = baseSlide(p, "CHAPTER 7", 8, "Chapter 7, pp. 289-300");
  addLead(s, "운영체제와 오픈소스 라이선스는 제품 구조와 공개 범위를 함께 결정한다");
  addBullets(s, [
    "Linux는 하드웨어 지원이 풍부하지만 MMU, 실시간성, GPL 의무를 검토해야 한다.",
    "uClinux는 MMU가 없는 프로세서를 대상으로 하고 eCos는 임베디드용 모듈 구성을 제공한다.",
    "NetBSD 계열 라이선스는 상용 코드 공개 부담이 상대적으로 적다.",
    "GPL 코드와 자체 애플리케이션의 경계를 초기 설계부터 명확하게 유지한다.",
    "사용한 코드, 라이브러리, 글꼴과 라이선스 사본을 감사 문서로 관리한다.",
    "오픈소스 라이선스를 지켜도 구현 알고리즘의 특허 문제는 별도로 확인한다.",
  ], { left: 80, top: 165, width: 1100, height: 430 }, { fontSize: 21, spaceAfter: 11 });
  return p;
}

function buildChapter8() {
  const p = makeDeck();
  let s;

  s = baseSlide(p, "CHAPTER 8", 1, "Chapter 8, pp. 301-302, Figure 8.2");
  addLead(s, "RS-232는 MCU와 PC 사이에서 가장 단순하게 확인할 수 있는 직렬 통신이다");
  addBullets(s, [
    "DTE는 PC나 터미널처럼 데이터를 만드는 장치다.",
    "DCE는 모뎀이나 전압 변환 회로처럼 통신 매체에 연결하는 장치다.",
    "간단한 연결은 TXD, RXD와 공통 접지만 사용한다.",
    "RTS/CTS와 DTR/DSR은 흐름 제어와 준비 상태를 전달한다.",
  ], { left: 78, top: 175, width: 470, height: 340 }, { fontSize: 20, spaceAfter: 12 });
  addImageFrame(s, { left: 610, top: 65, width: 570, height: 560 });
  addImage(s, 319, { left: 625, top: 80, width: 540, height: 520 }, { left: 0.07, top: 0.19, right: 0.06, bottom: 0.26 }, "RS-232 DTE and DCE interface");
  addCaption(s, "Figure 8.2. 양쪽 인터페이스는 통신 신호와 장치가 사용하는 논리 전압 사이를 변환한다.", { left: 620, top: 603, width: 550, height: 43 });

  s = baseSlide(p, "CHAPTER 8", 2, "Chapter 8, pp. 303-308");
  addLead(s, "비동기 통신에 필요한 신호는 목적에 따라 데이터, 상태와 흐름 제어로 나뉜다", 78, 48, 1110, 58);
  const t8 = s.tables.add({ rows: 7, columns: 3, left: 85, top: 130, width: 1080, height: 390, values: [
    ["신호", "방향과 역할", "단순 3선 연결"],
    ["TXD", "장치가 직렬 데이터를 송신", "사용"],
    ["RXD", "상대 장치의 직렬 데이터를 수신", "사용"],
    ["GND", "두 장치의 신호 기준", "사용"],
    ["RTS / CTS", "송신 요청과 송신 허가", "생략 가능"],
    ["DTR / DSR", "단말과 통신 장비의 준비 상태", "생략 가능"],
    ["DCD / RI", "반송파 검출과 호출 신호", "모뎀에서 주로 사용"],
  ] });
  styleTable(t8);
  addText(s, "DB-25와 DB-9는 핀 번호가 다르므로 커넥터 이름만 보고 배선하지 않는다.", { left: 100, top: 555, width: 1060, height: 50 }, { fontSize: 21, bold: true, color: colors.blue, textAlign: "center" });

  s = baseSlide(p, "CHAPTER 8", 3, "Chapter 8, pp. 308-309, Figure 8.3");
  addLead(s, "RS-232 전압은 MCU의 3.3 V·5 V 논리와 극성도 범위도 다르다");
  addBullets(s, [
    "Mark는 논리 1이며 음전압으로 표현한다.",
    "Space는 논리 0이며 양전압으로 표현한다.",
    "-3 V와 +3 V 사이는 신뢰할 수 없는 전이 영역이다.",
    "MAX232 계열 변환기는 전압 레벨과 논리 극성을 함께 변환한다.",
    "RS-232 포트를 MCU GPIO에 직접 연결하면 입력이 손상될 수 있다.",
  ], { left: 78, top: 175, width: 500, height: 370 }, { fontSize: 20, spaceAfter: 11 });
  addImageFrame(s, { left: 625, top: 115, width: 530, height: 420 });
  addImage(s, 326, { left: 640, top: 130, width: 500, height: 385 }, { left: 0.10, top: 0.46, right: 0.10, bottom: 0.22 }, "RS-232 signal voltage ranges");
  addCaption(s, "Figure 8.3. 전이 영역을 피하는 전압 여유가 케이블 잡음에 대한 내성을 만든다.", { left: 630, top: 550, width: 520, height: 45 });

  s = baseSlide(p, "CHAPTER 8", 4, "Chapter 8, pp. 310-312, Figure 8.4");
  addLead(s, "9600 bps에서는 각 비트를 약 104 μs 동안 유지하고 비트 중앙에서 샘플링한다");
  addBullets(s, [
    "유휴 상태는 Mark이며 시작 비트가 Space로 바뀌면 수신이 시작된다.",
    "데이터는 일반적으로 최하위 비트부터 전송한다.",
    "8N1은 데이터 8비트, 패리티 없음, 정지 비트 1개를 뜻한다.",
    "수신 시점이 비트 경계에 가까우면 클록 오차와 잡음에 민감해진다.",
  ], { left: 78, top: 170, width: 475, height: 340 }, { fontSize: 20, spaceAfter: 12 });
  addImageFrame(s, { left: 600, top: 105, width: 570, height: 480 });
  addImage(s, 329, { left: 615, top: 120, width: 540, height: 445 }, { left: 0.10, top: 0.23, right: 0.10, bottom: 0.24 }, "9600 bps asynchronous RS-232 timing");
  addCaption(s, "Figure 8.4. 시작 비트와 정지 비트 사이에서 8개 데이터 비트를 일정 간격으로 읽는다.", { left: 610, top: 590, width: 550, height: 45 });

  s = baseSlide(p, "CHAPTER 8", 5, "Chapter 8, pp. 313-333");
  addLead(s, "하드웨어 UART가 없어도 GPIO와 정확한 지연으로 송수신 기능을 만들 수 있다");
  addBullets(s, [
    "송신 루틴은 출력 레벨을 바꾸고 한 비트 시간만큼 기다리는 과정을 반복한다.",
    "수신 루틴은 시작 비트를 찾은 뒤 비트 중앙에서 여덟 번 샘플링한다.",
    "어셈블리 코드는 작고 제어가 정확하지만 클록이 바뀌면 지연값을 다시 계산해야 한다.",
    "C의 putc(), getc(), printf()는 코드를 줄이지만 프로그램 메모리를 더 사용한다.",
    "타이밍이 중요한 수신부는 컴파일러 라이브러리나 하드웨어 UART가 안정적이다.",
  ], { left: 80, top: 165, width: 1100, height: 420 }, { fontSize: 21, spaceAfter: 12 });

  s = baseSlide(p, "CHAPTER 8", 6, "Chapter 8, pp. 333-342");
  addLead(s, "C, 어셈블리와 BASIC은 같은 통신 기능을 서로 다른 추상화 수준에서 구현한다");
  addBullets(s, [
    "어셈블리: 비트 타이밍과 레지스터를 직접 제어하며 코드가 작다.",
    "C: 통신 라이브러리로 개발 속도와 가독성을 높인다.",
    "PicBasic Pro: SerIn, SerOut, DEBUG 명령으로 빠르게 기능을 검증한다.",
    "소프트웨어 UART는 다른 작업 중 문자를 놓칠 수 있으므로 타임아웃과 폴링 주기를 설계한다.",
    "처리 시간이 부족하면 인터럽트 기반 하드웨어 UART와 송수신 버퍼를 사용한다.",
  ], { left: 82, top: 170, width: 1090, height: 400 }, { fontSize: 22, spaceAfter: 14 });

  s = baseSlide(p, "CHAPTER 8", 7, "Chapter 8, pp. 342-346, Schematic 8.5 and Figure 8.13");
  addLead(s, "I²C는 두 개의 오픈드레인 선에서 주소와 클록을 공유하는 버스다");
  addBullets(s, [
    "SDA는 데이터, SCL은 클록을 전달한다.",
    "장치는 선을 HIGH로 밀지 않고 LOW로만 끌어내린다.",
    "풀업 저항이 아무도 선을 구동하지 않을 때 HIGH 상태를 만든다.",
    "SCL이 HIGH일 때 SDA가 내려가면 START, 올라가면 STOP이다.",
  ], { left: 78, top: 175, width: 450, height: 330 }, { fontSize: 20, spaceAfter: 11 });
  addImageFrame(s, { left: 575, top: 60, width: 600, height: 565 });
  addImage(s, 363, { left: 590, top: 75, width: 570, height: 530 }, { left: 0.08, top: 0.05, right: 0.08, bottom: 0.20 }, "I2C open-drain bus and START STOP timing");
  addCaption(s, "Schematic 8.5와 Figure 8.13. 풀업 구조와 START·STOP 조건이 I²C의 기본 전기 규칙을 정의한다.", { left: 580, top: 610, width: 590, height: 43 });

  s = baseSlide(p, "CHAPTER 8", 8, "Chapter 8, pp. 347-351, Figures 8.15-8.18");
  addLead(s, "wired-AND 구조는 느린 장치의 클록 연장과 여러 마스터의 중재를 가능하게 한다");
  addBullets(s, [
    "한 장치라도 SCL을 LOW로 유지하면 전체 버스가 LOW가 된다.",
    "슬레이브는 처리 시간이 필요할 때 SCL을 LOW로 잡아 클록을 연장한다.",
    "마스터는 SDA에 쓴 값과 실제 버스 값을 비교해 중재 패배를 감지한다.",
    "7비트 주소 뒤의 최하위 비트가 읽기 또는 쓰기 방향을 결정한다.",
  ], { left: 78, top: 175, width: 470, height: 350 }, { fontSize: 20, spaceAfter: 12 });
  addImageFrame(s, { left: 605, top: 82, width: 555, height: 500 });
  addImage(s, 366, { left: 620, top: 97, width: 525, height: 470 }, { left: 0.12, top: 0.05, right: 0.12, bottom: 0.08 }, "I2C wired AND logic");
  addCaption(s, "Figure 8.16. 어느 장치든 LOW를 출력하면 버스 상태도 LOW가 된다.", { left: 615, top: 590, width: 535, height: 40 });

  s = baseSlide(p, "CHAPTER 8", 9, "Chapter 8, pp. 352-377, Schematic 8.6");
  addLead(s, "AVR 마스터와 PIC 슬레이브 예제는 주소, 상태 코드와 인터럽트를 하나의 시스템으로 연결한다");
  addBullets(s, [
    "AVR은 START를 만들고 슬레이브 주소와 데이터를 전송한다.",
    "TWI 상태 레지스터로 주소 ACK, 데이터 ACK와 오류를 확인한다.",
    "PIC MSSP는 주소 일치와 각 바이트 전송마다 인터럽트를 발생시킨다.",
    "마지막 수신 바이트에는 NAK를 보내 읽기 세션을 끝낸다.",
    "PC 입력은 RS-232로 AVR에 들어오고 I²C를 통해 PIC 출력 래치로 전달된다.",
  ], { left: 78, top: 175, width: 485, height: 390 }, { fontSize: 19, spaceAfter: 10 });
  addImageFrame(s, { left: 610, top: 85, width: 555, height: 500 });
  addImage(s, 370, { left: 625, top: 100, width: 525, height: 465 }, { left: 0.03, top: 0.04, right: 0.03, bottom: 0.32 }, "AVR I2C and RS-232 circuit");
  addCaption(s, "Schematic 8.6. AVR, RS-232 변환기, I²C 풀업과 출력 래치가 결합된 실습 회로다.", { left: 615, top: 590, width: 540, height: 40 });

  s = baseSlide(p, "CHAPTER 8", 10, "Chapter 8, pp. 378-380, Figure 8.23");
  addLead(s, "SPI는 짧은 거리에서 작은 데이터를 빠르게 주고받는 동기식 인터페이스다");
  addBullets(s, [
    "SCK가 전송 시점을 만들고 SDO·SDI가 양방향 데이터를 운반한다.",
    "CS 또는 SS가 통신할 슬레이브를 선택한다.",
    "클록 극성과 데이터 유효 에지 조합으로 네 가지 모드가 만들어진다.",
    "두 장치가 공통으로 지원하는 모드를 선택해야 한다.",
    "단일 종단 신호이므로 긴 케이블이나 잡음이 많은 환경에는 불리하다.",
  ], { left: 78, top: 165, width: 470, height: 405 }, { fontSize: 19, spaceAfter: 10 });
  addImageFrame(s, { left: 595, top: 70, width: 575, height: 535 });
  addImage(s, 396, { left: 610, top: 85, width: 545, height: 500 }, { left: 0.04, top: 0.34, right: 0.04, bottom: 0.14 }, "Four SPI operating modes");
  addCaption(s, "Figure 8.23. 모드마다 수신기가 데이터를 읽는 클록 에지가 달라진다.", { left: 605, top: 608, width: 555, height: 38 });

  s = baseSlide(p, "CHAPTER 8", 11, "Chapter 8, pp. 380-385, Figure 8.24a");
  addLead(s, "CAN은 오류 검출과 우선순위 중재를 하드웨어가 처리하는 다중 노드 버스다");
  addBullets(s, [
    "차동 버스와 전용 트랜시버를 사용해 산업 환경에서 높은 신뢰성을 확보한다.",
    "표준 프레임은 11비트 ID, 확장 프레임은 29비트 ID를 사용한다.",
    "데이터 프레임은 최대 8바이트와 CRC, ACK 필드를 포함한다.",
    "컨트롤러가 CRC 생성과 오류 검출을 처리해 CPU 부담을 줄인다.",
  ], { left: 78, top: 175, width: 430, height: 350 }, { fontSize: 19, spaceAfter: 11 });
  addImageFrame(s, { left: 545, top: 70, width: 625, height: 540 });
  addImage(s, 400, { left: 560, top: 85, width: 595, height: 505 }, { left: 0.02, top: 0.28, right: 0.02, bottom: 0.07 }, "Standard CAN data frame format");
  addCaption(s, "Figure 8.24a. ID, 제어, 데이터, CRC와 ACK가 하나의 CAN 데이터 프레임을 구성한다.", { left: 550, top: 612, width: 610, height: 38 });

  s = baseSlide(p, "CHAPTER 8", 12, "Chapter 8, pp. 385-387, Figure 8.25");
  addLead(s, "CAN 중재에서는 낮은 ID 값이 높은 우선순위를 얻고 승리 메시지는 손상되지 않는다");
  addBullets(s, [
    "논리 0은 dominant, 논리 1은 recessive 상태다.",
    "노드가 recessive를 보냈는데 버스가 dominant이면 해당 노드는 전송을 중단한다.",
    "중요한 경보 메시지에 낮은 ID를 할당하면 정상 메시지보다 먼저 전송된다.",
    "Acceptance filter와 mask는 필요한 ID만 수신 버퍼에 저장한다.",
    "필터링은 CPU의 메시지 처리량을 줄이지만 모든 정상 프레임에는 ACK를 응답한다.",
  ], { left: 82, top: 170, width: 1090, height: 400 }, { fontSize: 21, spaceAfter: 13 });
  addText(s, "RS-232에서 익힌 프레임과 타이밍 개념은 I²C, SPI, CAN을 이해하는 기반이 된다.", { left: 100, top: 575, width: 1060, height: 50 }, { fontSize: 22, bold: true, color: colors.blue, textAlign: "center" });
  return p;
}

function buildChapter9() {
  const p = makeDeck();
  let s;

  s = baseSlide(p, "CHAPTER 9", 1, "Chapter 9, pp. 389-390");
  addLead(s, "센서와 액추에이터 인터페이스는 논리 기능보다 전기적 스트레스를 먼저 다룬다");
  addBullets(s, [
    "3.3 V와 5 V 사이의 논리 임계값과 입력 내압을 확인한다.",
    "외부 배선에서 들어오는 ESD와 서지가 MCU 핀에 도달하기 전에 우회시킨다.",
    "부족한 디지털 I/O는 버퍼, 멀티플렉서, 래치와 시프트 레지스터로 확장한다.",
    "릴레이, 모터와 솔레노이드는 전류 증폭과 유도성 에너지 처리가 필요하다.",
    "ADC 성능은 변환기 한 개가 아니라 전체 데이터 수집 채널로 측정한다.",
  ], { left: 80, top: 170, width: 1100, height: 410 }, { fontSize: 22, spaceAfter: 14 });

  s = baseSlide(p, "CHAPTER 9", 2, "Chapter 9, pp. 389-392, Table 9.1");
  addLead(s, "3.3 V 출력이 5 V 입력을 구동할 때 HIGH 임계값이 가장 흔한 실패 원인이다", 78, 48, 1100, 58);
  const t9a = s.tables.add({ rows: 5, columns: 3, left: 90, top: 135, width: 1080, height: 300, values: [
    ["입력 로직 계열", "VIH 최소값", "3.3 V 출력과의 관계"],
    ["HC / VHC", "0.7 × VCC", "5 V 공급 시 3.5 V가 필요하므로 규격상 불충분"],
    ["HCT / VHCT", "2.0 V", "3.3 V CMOS 출력과 호환"],
    ["LVT / LVX", "2.0 V", "공급 전압과 무관한 임계값으로 사용 가능"],
    ["5 V tolerant 입력", "제품별 확인", "5 V 출력이 3.3 V 장치를 손상시키지 않도록 설계"],
  ] });
  styleTable(t9a);
  addBullets(s, [
    "3.3 V 입력에 5 V를 가할 때는 입력의 5 V tolerance와 내부 보호 다이오드를 확인한다.",
    "실온에서 동작하는 조합도 온도와 부품 편차에서 노이즈 마진을 잃을 수 있다.",
  ], { left: 105, top: 475, width: 1050, height: 125 }, { fontSize: 20, spaceAfter: 10 });

  s = baseSlide(p, "CHAPTER 9", 3, "Chapter 9, pp. 392-398, Figure 9.5");
  addLead(s, "보호소자는 처리 에너지와 반응 속도가 달라 여러 단계를 조합해야 한다");
  addBullets(s, [
    "GDT는 큰 서지 에너지를 처리하지만 반응이 느리다.",
    "MOV는 전력선 과도전압에 적합하고 TVS는 빠른 ESD 억제에 적합하다.",
    "직렬 저항은 보호 다이오드 전류를 제한하고 입력 용량과 저역통과 필터를 만든다.",
    "5 V tolerant 입력은 상단 보호 다이오드가 없을 수 있으므로 외부 보호 경로가 필요하다.",
  ], { left: 78, top: 175, width: 450, height: 360 }, { fontSize: 19, spaceAfter: 11 });
  addImageFrame(s, { left: 575, top: 55, width: 590, height: 590 });
  addImage(s, 413, { left: 590, top: 70, width: 560, height: 555 }, { left: 0.14, top: 0.11, right: 0.14, bottom: 0.08 }, "ESD protection diode arrangements");
  addCaption(s, "Figure 9.5. 내부 보호 다이오드는 ESD를 막지만 혼합 전압 시스템에서는 과전류 경로가 될 수 있다.", { left: 580, top: 625, width: 580, height: 36 });

  s = baseSlide(p, "CHAPTER 9", 4, "Chapter 9, pp. 397-399, Figure 9.6");
  addLead(s, "좋은 보호회로도 PCB에서 방전 경로를 잘못 배치하면 우회된다");
  addBullets(s, [
    "커넥터에서 들어온 과도전압은 가장 짧은 경로로 보호소자와 접지에 전달한다.",
    "보호 전·후 신호 패턴을 가깝게 평행 배치하지 않는다.",
    "층간 비아가 너무 가까우면 ESD가 보호망을 건너뛸 수 있다.",
    "패턴 간격과 귀환 경로는 부품 정격만큼 중요한 보호 설계 요소다.",
  ], { left: 78, top: 175, width: 470, height: 350 }, { fontSize: 20, spaceAfter: 13 });
  addImageFrame(s, { left: 605, top: 110, width: 545, height: 390 });
  addImage(s, 416, { left: 620, top: 125, width: 515, height: 355 }, { left: 0.10, top: 0.05, right: 0.10, bottom: 0.55 }, "PCB layout that permits ESD arcing");
  addCaption(s, "Figure 9.6. 보호된 신호와 보호 전 신호 사이의 비아 간격이 좁으면 아크가 발생할 수 있다.", { left: 610, top: 520, width: 535, height: 52 });

  s = baseSlide(p, "CHAPTER 9", 5, "Chapter 9, pp. 398-402, Figure 9.7");
  addLead(s, "디지털 입력 확장 방식은 핀 수보다 버스 부하와 동시 샘플링 요구로 선택한다");
  addBullets(s, [
    "74HC244는 간단하지만 각 출력의 용량이 데이터 버스에 누적된다.",
    "74HC257은 여러 입력을 선택해 입력당 버스 부하를 줄인다.",
    "74HC574는 16개 이상의 입력을 같은 순간에 캡처할 수 있다.",
    "74HC597 체인은 한 데이터 비트로 많은 입력을 직렬 수집한다.",
  ], { left: 78, top: 175, width: 425, height: 340 }, { fontSize: 19, spaceAfter: 12 });
  addImageFrame(s, { left: 535, top: 55, width: 630, height: 590 });
  addImage(s, 417, { left: 550, top: 70, width: 600, height: 555 }, { left: 0.03, top: 0.04, right: 0.03, bottom: 0.08 }, "Digital input expansion circuits");
  addCaption(s, "Figure 9.7. 버퍼, 멀티플렉서, 래치와 시프트 체인은 서로 다른 I/O 확장 조건을 해결한다.", { left: 540, top: 627, width: 620, height: 34 });

  s = baseSlide(p, "CHAPTER 9", 6, "Chapter 9, pp. 402-404, Figure 9.8");
  addLead(s, "디지털 출력 확장에서는 리셋 직후의 출력 상태와 단락 보호가 추가로 필요하다");
  addBullets(s, [
    "74HC574는 외부 출력 인에이블과 저항으로 초기 HIGH·LOW를 선택한다.",
    "74HC273은 CLR 신호로 모든 출력을 0으로 초기화한다.",
    "74HC259는 한 데이터 비트와 주소선으로 특정 출력만 갱신한다.",
    "74HC594/595는 직렬 데이터를 여러 병렬 출력으로 확장한다.",
  ], { left: 78, top: 175, width: 430, height: 350 }, { fontSize: 19, spaceAfter: 12 });
  addImageFrame(s, { left: 540, top: 60, width: 620, height: 570 });
  addImage(s, 420, { left: 555, top: 75, width: 590, height: 535 }, { left: 0.03, top: 0.05, right: 0.03, bottom: 0.18 }, "Digital output expansion circuits");
  addCaption(s, "Figure 9.8. 출력 유지 방식, 리셋 기능과 버스 부하가 회로 선택을 결정한다.", { left: 545, top: 632, width: 610, height: 32 });

  s = baseSlide(p, "CHAPTER 9", 7, "Chapter 9, pp. 404-409, Figure 9.9");
  addLead(s, "BJT 드라이버는 부하 전류뿐 아니라 베이스 전류와 포화 발열을 계산해야 한다");
  addBullets(s, [
    "스위칭 포화 상태의 전류이득은 증폭 영역보다 훨씬 작게 잡는다.",
    "500 mA 부하에서 강제 β를 10으로 잡으면 약 50 mA의 베이스 전류가 필요하다.",
    "트랜지스터 손실은 VCE(sat) × IC와 VBE × IB를 합산한다.",
    "고전압 PNP 구동은 베이스 저항에서 V²/R 발열이 크게 증가한다.",
    "ULN2803 같은 다채널 Darlington은 편리하지만 출력 전압강하가 크다.",
  ], { left: 78, top: 165, width: 460, height: 410 }, { fontSize: 18, spaceAfter: 9 });
  addImageFrame(s, { left: 585, top: 85, width: 580, height: 500 });
  addImage(s, 423, { left: 600, top: 100, width: 550, height: 465 }, { left: 0.03, top: 0.05, right: 0.03, bottom: 0.39 }, "BJT low-side and two-stage driver circuits");
  addCaption(s, "Figure 9.9. 단일 저측 드라이버와 2단 고측 드라이버 모두 전류와 열 계산이 필요하다.", { left: 590, top: 590, width: 570, height: 40 });

  s = baseSlide(p, "CHAPTER 9", 8, "Chapter 9, pp. 409-411, Table 9.2 and Figure 9.11");
  addLead(s, "MOSFET은 낮은 도통 저항과 작은 구동 전류로 더 큰 부하를 효율적으로 스위칭한다");
  addBullets(s, [
    "로직 레벨에서 지정된 RDS(on)을 확인해야 완전히 켜지는지 판단할 수 있다.",
    "게이트의 지속 전류는 작지만 충방전 전류와 스위칭 속도는 고려해야 한다.",
    "VGS 최대 정격은 보통 약 20 V이므로 제너 다이오드 등으로 제한한다.",
    "데이터시트의 최대 드레인 전류는 이상적인 냉각 조건일 수 있다.",
    "ESD와 과도전압에 민감하므로 게이트 보호와 PCB 배치를 함께 설계한다.",
  ], { left: 78, top: 165, width: 465, height: 410 }, { fontSize: 18, spaceAfter: 9 });
  addImageFrame(s, { left: 590, top: 78, width: 575, height: 510 });
  addImage(s, 427, { left: 605, top: 93, width: 545, height: 475 }, { left: 0.07, top: 0.06, right: 0.07, bottom: 0.11 }, "MOSFET selection table and gate clamp circuit");
  addCaption(s, "Table 9.2와 Figure 9.11. 게이트 클램프는 30 V 전원에서도 MOSFET의 VGS 정격을 지킨다.", { left: 595, top: 595, width: 565, height: 40 });

  s = baseSlide(p, "CHAPTER 9", 9, "Chapter 9, pp. 411-417, Figure 9.12");
  addLead(s, "릴레이와 솔레노이드의 자기 에너지는 전원을 끈 뒤에도 전류를 계속 흐르게 한다");
  addBullets(s, [
    "DC 코일은 플라이백 다이오드로 역기전력을 제한한다.",
    "AC 부하는 단방향 다이오드를 사용할 수 없어 RC 스너버로 에너지를 소모한다.",
    "스너버는 접점 아크와 EMI를 줄이지만 OFF 상태의 누설전류를 만든다.",
    "누설전류가 접촉기의 유지전류보다 크면 장치가 완전히 꺼지지 않을 수 있다.",
    "스너버 위치는 부하 배선 길이와 방사 잡음 경로를 고려해 결정한다.",
  ], { left: 78, top: 165, width: 455, height: 410 }, { fontSize: 18, spaceAfter: 9 });
  addImageFrame(s, { left: 575, top: 70, width: 595, height: 520 });
  addImage(s, 430, { left: 590, top: 85, width: 565, height: 485 }, { left: 0.03, top: 0.04, right: 0.03, bottom: 0.38 }, "Flyback diode and RC snubber circuit");
  addCaption(s, "Figure 9.12. DC 측 플라이백 다이오드와 AC 측 스너버가 저장된 자기 에너지를 관리한다.", { left: 580, top: 596, width: 580, height: 40 });

  s = baseSlide(p, "CHAPTER 9", 10, "Chapter 9, pp. 417-418");
  addLead(s, "기계식 릴레이와 SSR은 절연 방식은 비슷해도 열과 누설 특성이 다르다", 78, 48, 1100, 58);
  const t9b = s.tables.add({ rows: 7, columns: 3, left: 100, top: 130, width: 1060, height: 420, values: [
    ["항목", "기계식 릴레이", "SSR"],
    ["스위치", "금속 접점", "BJT, MOSFET, SCR 또는 TRIAC"],
    ["수명", "접점 마모와 아크의 영향", "움직이는 부품이 없어 장수명"],
    ["OFF 누설", "매우 작음", "반도체 특성상 존재"],
    ["발열", "접점저항에 따른 I²R 손실", "도통 전압강하와 온도 디레이팅"],
    ["구동", "코일 전류와 플라이백 처리", "입력 LED에 수 mA에서 수십 mA"],
    ["선택 기준", "낮은 접점저항과 완전 차단", "빠른 동작과 높은 반복 수명"],
  ] });
  styleTable(t9b);
  addText(s, "SSR도 유도성 부하를 끄면 역기전력이 발생하므로 부하 측 스너버나 플라이백 경로가 필요하다.", { left: 110, top: 580, width: 1040, height: 48 }, { fontSize: 20, bold: true, color: colors.blue, textAlign: "center" });

  s = baseSlide(p, "CHAPTER 9", 11, "Chapter 9, pp. 418-420, Figure 9.14");
  addLead(s, "FPGA와 CPLD는 단순 핀 확장보다 고속 데이터 경로에서 가장 큰 효과를 낸다");
  addBullets(s, [
    "첫 FPGA는 Bayer 패턴의 센서 데이터를 RGB 픽셀로 변환한다.",
    "두 번째 FPGA는 스케일링과 색 보정 같은 실시간 영상 처리를 수행한다.",
    "CPLD는 프레임 캡처와 고속 SRAM 인터페이스를 제어한다.",
    "CPU는 영상 스트림 대신 설정값과 캡처된 프레임을 처리한다.",
  ], { left: 78, top: 175, width: 430, height: 350 }, { fontSize: 19, spaceAfter: 11 });
  addImageFrame(s, { left: 540, top: 75, width: 625, height: 520 });
  addImage(s, 436, { left: 555, top: 90, width: 595, height: 485 }, { left: 0.03, top: 0.04, right: 0.03, bottom: 0.40 }, "FPGA based digital camera signal path");
  addCaption(s, "Figure 9.14. 실시간 영상 데이터는 FPGA가 처리하고 CPU는 설정과 네트워크 기능을 담당한다.", { left: 545, top: 600, width: 615, height: 40 });

  s = baseSlide(p, "CHAPTER 9", 12, "Chapter 9, pp. 420-427, Figure 9.15");
  addLead(s, "ADC 평가는 변환기보다 센서부터 전원·배선까지 포함한 전체 DAQ 채널을 대상으로 한다");
  addBullets(s, [
    "Delta-Sigma는 느리지만 고분해능 측정에 적합하다.",
    "Flash ADC는 매우 빠르며 영상과 통신 신호에 사용한다.",
    "SAR ADC는 속도, 분해능과 가격의 균형이 좋아 임베디드 시스템에서 널리 사용한다.",
    "실험은 2.5 V 정밀 기준을 32,768회 샘플링한 뒤 직렬 포트로 Linux PC에 전송한다.",
    "샘플링을 먼저 끝낸 뒤 전송해 직렬 통신 잡음이 ADC에 결합되는 가능성을 줄인다.",
  ], { left: 78, top: 160, width: 500, height: 430 }, { fontSize: 18, spaceAfter: 9 });
  addImageFrame(s, { left: 620, top: 115, width: 530, height: 330 });
  addImage(s, 439, { left: 635, top: 130, width: 500, height: 300 }, { left: 0.10, top: 0.04, right: 0.10, bottom: 0.64 }, "RCM3400 ADC characterization setup");
  addCaption(s, "Figure 9.15. 정밀 기준전압, RCM3400과 Linux 분석 PC로 DAQ 채널을 측정한다.", { left: 625, top: 465, width: 520, height: 42 });

  s = baseSlide(p, "CHAPTER 9", 13, "Chapter 9, pp. 428-435, Figure 9.16 and Table 9.3");
  addLead(s, "평균, 표준편차와 히스토그램을 함께 보면 오프셋과 잡음의 크기·형태를 구분할 수 있다");
  addBullets(s, [
    "평균과 이상적인 ADC 코드를 비교해 오프셋을 계산한다.",
    "표준편차는 RMS 잡음의 크기를 ADC 코드 또는 전압으로 나타낸다.",
    "여러 봉우리가 보이면 무작위 잡음보다 외부 결합 신호를 의심한다.",
    "실험 결과 gain 1, 2, 4, 5에서 유효 분해능은 11비트 수준이었다.",
    "gain 5의 최악 피크투피크 조건에서 noise-free resolution은 약 9.84비트였다.",
  ], { left: 78, top: 165, width: 485, height: 405 }, { fontSize: 18, spaceAfter: 9 });
  addImageFrame(s, { left: 610, top: 82, width: 545, height: 430 });
  addImage(s, 450, { left: 625, top: 97, width: 515, height: 395 }, { left: 0.13, top: 0.04, right: 0.13, bottom: 0.54 }, "ADC sample histogram");
  addCaption(s, "Figure 9.16. 데이터가 두세 개 코드에 집중되어 채널 잡음이 매우 작음을 보여준다.", { left: 615, top: 520, width: 535, height: 42 });
  addText(s, "측정하지 않은 DAQ 채널과 실제 센서 조건에서도 같은 절차를 반복해야 한다.", { left: 625, top: 575, width: 520, height: 55 }, { fontSize: 19, bold: true, color: colors.blue, textAlign: "center" });
  return p;
}

async function renderDeck(presentation, stem) {
  const dir = path.join(previewDir, stem);
  await fs.mkdir(dir, { recursive: true });
  for (const [i, slide] of presentation.slides.items.entries()) {
    const blob = await presentation.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(path.join(dir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await blob.arrayBuffer()));
  }
  const montage = await presentation.export({ format: "webp", montage: true });
  await fs.writeFile(path.join(dir, "montage.webp"), new Uint8Array(await montage.arrayBuffer()));
}

async function finalizeDeck(presentation, stem, finalName, tableSlides = []) {
  await renderDeck(presentation, stem);
  const stagingDir = path.join(buildDir, "finalizer", stem);
  await fs.mkdir(stagingDir, { recursive: true });
  const candidatePath = path.join(stagingDir, "candidate.pptx");
  await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
  const finalPath = path.join(outputDir, finalName);
  const result = await finalizePresentation({
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable,
    integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit", ...tableSlides.flatMap(n => ["--require-native-table-slide", String(n)])],
    requiredNativeTableOwnerSlides: tableSlides,
    requiredNativeChartOwnerSlides: [],
    fontPolicy: { basis: "design", families: [font, "Aptos"] },
    scriptFonts: { Hang: font },
    verifyArtifactToolImport: true,
    receiptPath: path.join(stagingDir, `${finalName}.validation.json`),
  });
  return { finalPath, result };
}

const decks = [
  [buildChapter7(), "chapter7", "Chapter_7_Microcontroller_Design_Decisions_final.pptx", [3]],
  [buildChapter8(), "chapter8", "Chapter_8_Microcontroller_Networking_final.pptx", [2]],
  [buildChapter9(), "chapter9", "Chapter_9_Sensors_Actuators_Interfacing_final.pptx", [2, 10]],
];

for (const [deck, stem, name, tables] of decks) {
  const info = await finalizeDeck(deck, stem, name, tables);
  console.log(JSON.stringify({ stem, finalPath: info.finalPath, validation: info.result }, null, 2));
}
