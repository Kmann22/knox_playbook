# Deploy on Vercel (free Hobby plan)
1. Install Node.js LTS, then: npm install -g vercel
2. In this folder: vercel login
3. vercel            (answer: set up and deploy -> yes; link to existing -> no; name -> e.g. trump-playbook-yourname; directory -> ./ ; override settings -> no)
4. vercel env add GEMINI_API_KEY production   (paste your key when asked; never put it in a file)
5. vercel --prod
6. Check https://<name>.vercel.app/api/ask shows "ok":true, then Explore -> Load the data -> Ask the AI.
