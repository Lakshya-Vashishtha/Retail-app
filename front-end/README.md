# Front-end (Vite + React + TypeScript)

Follow these commands in your terminal (Windows `cmd.exe`) to create and run the project exactly as requested:

1) Create the Vite project

```bash
npm create vite@latest front-end -- --template react-ts
cd front-end
```

2) Install dependencies

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install react-router-dom axios @tanstack/react-query apexcharts react-apexcharts
npm install react-hook-form zod
npm install react-toastify
npm install @mui/x-data-grid --save-dev
```

3) The repository already includes a prepared `src/` skeleton under `Front/front-end/src/` for quick development. If you ran the `npm create` step above, copy the skeleton files into your created project or start the project here by running `npm install` and `npm run dev`.

4) Start dev server

```bash
npm install
npm run dev
```

If you want, I can also run the `npm create` command here for you (it requires network and will modify workspace). Tell me if you want me to run it.