# Embedded Hardware Study & Design Project

이 저장소는 임베디드 하드웨어 전문 서적 **《Embedded Hardware: Know It All》 (Newnes / Elsevier)**의 핵심 챕터(Chapter 7, 8, 9)를 학습하고 분석한 내용과 관련 프레젠테이션 및 소스 자료를 정리한 프로젝트입니다.

---

## 📚 핵심 분석 문서
- **[Embedded Hardware Chapter 7, 8, 9 핵심 요약 및 실무 가이드](docs/Embedded_Hardware_Chapters_7_8_9_Summary.md)**
  - **Chapter 7: Choosing a Microcontroller and Other Design Decisions** (마이크로컨트롤러 선정, 7단계 개발 전략, 계측 장비, 오픈소스 라이선스)
  - **Chapter 8: The Essence of Microcontroller Networking** (RS-232, I2C, SPI, CAN 버스 프로토콜 심층 분석 및 비교 매트릭스)
  - **Chapter 9: Interfacing to Sensors and Actuators** (3.3V/5V 로직 레벨 변환, 입력 보호 회로, BJT/MOSFET 전력 스위칭, 플라이백 보호, ADC 아날로그 인터페이싱 및 노이즈 정량화)
  - **종합 아키텍처 설계 체크리스트**

---

## 📂 디렉토리 구조
```text
.
├── README.md                                    # 프로젝트 소개 및 가이드
├── docs/                                        # 분석 및 요약 문서
│   └── Embedded_Hardware_Chapters_7_8_9_Summary.md # 7, 8, 9장 핵심 분석 보고서
├── book/                                        # 원본 교재 전자책 (PDF)
│   └── Embedded Hardware_ Know It All ... .pdf
├── output/                                      # 생성된 최종 프레젠테이션 슬라이드 (.pptx)
│   └── pptx/
│       ├── Chapter_7_Microcontroller_Design_Decisions.pptx
│       ├── Chapter_8_Microcontroller_Networking.pptx
│       ├── Chapter_9_Sensors_Actuators_Interfacing.pptx
│       └── ...
└── ppt_build/                                   # 슬라이드 빌드 스크립트 및 에셋
    ├── build_chapters.mjs
    ├── assets/
    └── external_assets/
```

---

## 🛠️ 주요 다루는 기술 영역
- **Microcontrollers**: ARM7TDMI, Cortex-M, PIC, AVR, 8051, Rabbit RCM3400
- **Serial Protocols**: RS-232, I2C (Inter-Integrated Circuit), SPI, CAN (Controller Area Network)
- **Hardware Interfacing**: Logic Level Shifting, ESD/Surge Clamping (TVS, Schottky), High-Current Driver (BJT, Power MOSFET, Relay), Snubber/Flyback Diode, ADC Noise Characterization (ENOB)
