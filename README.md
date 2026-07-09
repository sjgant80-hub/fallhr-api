# @ai-native-solutions/fallhr-api

HTTP API wrapping [`fallhr-sdk`](https://github.com/sjgant80-hub/fallhr-sdk). Express + Docker.

## Run

```bash
npm i -g @ai-native-solutions/fallhr-api
fallhr-api                   # listens on :3000

# or from source
npm i && npm start

# or docker
docker compose up -d
```

## Endpoints

| Method | Path | Body |
| --- | --- | --- |
| `GET` | `/` | endpoint index |
| `GET` | `/health` | health probe |
| `GET` | `/rules` | UK statutory constants |
| `GET` | `/compliance/checks` | 12-item checklist |
| `POST` | `/compliance/summary` | `{completed:[ids]}` |
| `POST` | `/qa` | `{question}` |
| `POST` | `/bradford` | `{absences, employeeId}` |
| `POST` | `/review-due` | `{employee}` |
| `POST` | `/notice` | `{startDate}` |
| `POST` | `/redundancy` | `{ageAtDismissal, yearsService, weeklyPayCapped?}` |
| `POST` | `/auto-enrol` | `{age, annualEarnings}` |
| `POST` | `/dashboard` | `{state}` |
| `POST` | `/audit/append` | `{chain, action, payload?, reasoning?}` |
| `POST` | `/audit/verify` | `{chain}` |
| `POST` | `/export` | `{state}` |
| `POST` | `/import` | `{state, payload}` |

## curl examples

```bash
# UK HR Q&A
curl -sX POST localhost:3000/qa \
  -H 'content-type: application/json' \
  -d '{"question":"what is the s.1 statement?"}'

# Bradford factor
curl -sX POST localhost:3000/bradford \
  -H 'content-type: application/json' \
  -d '{"employeeId":"em_1","absences":[{"employeeId":"em_1","startDate":"2026-05-14","days":3},{"employeeId":"em_1","startDate":"2026-03-02","days":2}]}'

# Statutory redundancy (ERA 1996 s.162)
curl -sX POST localhost:3000/redundancy \
  -H 'content-type: application/json' \
  -d '{"ageAtDismissal":45,"yearsService":10,"weeklyPayCapped":719}'

# 12-item compliance
curl -s localhost:3000/compliance/checks | head
```

## License

MIT · AI-Native Solutions
