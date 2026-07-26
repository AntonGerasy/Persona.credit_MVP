# v35.1 Release Check

1. Deploy to Vercel and confirm Ready / Production.
2. Open `/privacy` and `/terms`.
3. Open one shared report and confirm the recipient disclaimer appears.
4. Run `npm run test:security:live` (BASE_URL is optional; production is the default).
5. Expected final line: `Security & lifecycle live test: PASSED`.
6. Confirm output includes:
   - account deletion removes stored user/report/document record
   - account deletion removes assessment history records
7. Run `npm run test:smoke`.
