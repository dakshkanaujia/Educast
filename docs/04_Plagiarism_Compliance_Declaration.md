# EduCast — Plagiarism Compliance Declaration

**Applicable to all deliverables: this document, the project report, the summary, the test/validation report, the user manual, the installation guide, and the complete source code.**

| | |
|---|---|
| **Project** | EduCast — Demand-Driven Tutoring Marketplace |
| **Author** | Utkersh Basnet |
| **Student ID / Email** | 2023ebcs010@online.bits-pilani.ac.in |
| **Programme** | BITS Pilani — B.E. Computer Science (Online) |
| **Supervisor** | _____________________________ |
| **Date** | 30 August 2026 |
| **Code Repository** | https://github.com/dakshkanaujia/Educast.git |

---

## 1. Declaration of Originality

I, **Utkersh Basnet**, hereby declare that:

1. The work presented in all deliverables of this project (documentation and source code) is my own original work, carried out as part of my BITS Pilani project, except where explicitly stated and attributed.
2. Any material — text, code, diagrams, or ideas — taken from third-party sources has been clearly acknowledged and cited.
3. I have not submitted this work, in whole or in part, for any other assessment or qualification.
4. To the best of my knowledge, the deliverables do not infringe the copyright or intellectual property of any third party.
5. All third-party software used is open-source, incorporated in accordance with its licence, and used as an unmodified dependency (see §4).

## 2. Scope of Compliance

This declaration covers **both** categories of deliverable, as required:

- **Documentation:** the project report, project summary, test & validation report, this declaration, the user manual, and the installation guide.
- **Code:** the entire backend (Go), frontend (React Native/Expo), database migrations, Dockerfiles, and helper scripts contained in the repository.

## 3. Originality of Code

- All application logic — the REST API controllers, authentication and role middleware, the WebSocket hub and client, the data models, and the frontend screens and contexts — was written specifically for this project.
- Standard, non-original elements are limited to: (a) idiomatic framework boilerplate (e.g. Gin route registration, GORM model tags), and (b) third-party open-source libraries consumed as dependencies (§4), which are **not** copied into the source tree but referenced via the package managers (Go modules / npm).
- No code was copied verbatim from other students, online tutorials, or repositories without attribution.

## 4. Acknowledged Third-Party Open-Source Dependencies

These are industry-standard libraries used under their respective open-source licences. They are declared as dependencies, not represented as original work.

**Backend (Go modules — `backend/go.mod`)**

| Library | Purpose | Typical Licence |
|---|---|---|
| `github.com/gin-gonic/gin` | HTTP web framework | MIT |
| `github.com/gin-contrib/cors` | CORS middleware | MIT |
| `gorm.io/gorm`, `gorm.io/driver/postgres` | ORM + Postgres driver | MIT |
| `github.com/gorilla/websocket` | WebSocket implementation | BSD-2-Clause |
| `github.com/golang-jwt/jwt/v5` | JWT tokens | MIT |
| `golang.org/x/crypto` (bcrypt) | Password hashing | BSD-3-Clause |
| `github.com/google/uuid` | UUID generation | BSD-3-Clause |
| `github.com/joho/godotenv` | `.env` loading | MIT |

**Frontend (npm — `frontend/package.json`)**

| Library | Purpose | Typical Licence |
|---|---|---|
| `expo`, `react`, `react-native` | App runtime/framework | MIT |
| `@react-navigation/*` | Navigation | MIT |
| `axios` | HTTP client | MIT |
| `@react-native-async-storage/async-storage` | Local storage | MIT |

**Infrastructure**

| Component | Purpose | Licence |
|---|---|---|
| PostgreSQL 16 (Docker image) | Database | PostgreSQL Licence |
| Docker / Docker Compose | Containerisation | Apache-2.0 |

> Licence names above are stated to the best of the author's knowledge; the authoritative licence for each package is the one shipped with that package.

## 5. Use of AI / Automated Tools

Any use of AI-assisted or automated tooling during development (e.g. for scaffolding, containerisation, debugging assistance, or documentation drafting) was used as a productivity aid under the author's direction and review. All resulting code and documentation were reviewed, tested, and are the responsibility of the author. This is disclosed here in the interest of full transparency and academic honesty.

## 6. Plagiarism Check

The author affirms willingness to submit all deliverables to the institution's plagiarism-detection process (e.g. Turnitin for documents and code-similarity checks for source) and to any additional verification the supervisor or examiners may require.

> **Note:** This is a declaration of compliance. The generation of an official similarity report/percentage is performed by the institution's designated plagiarism-detection tools; this document does not itself constitute that machine-generated report.

## 7. Author Signature

I confirm that the above declaration is true and complete.

- Name: **Utkersh Basnet**
- Signature: _____________________________
- Date: ____________

## 8. Supervisor Acknowledgement (optional)

- Supervisor Name: _____________________________
- Signature: _____________________________  Date: ____________
