# 📋 Implementation Checklist - Production Structure

**Status**: In Planning  
**Last Updated**: May 8, 2026  
**Estimated Duration**: 3-4 weeks

---

## 📅 Phase 1: Foundation & Planning (Days 1-3)

### Week 1 - Foundation Setup

- [ ] **Team Alignment**
  - [ ] Review PRODUCTION_STRUCTURE_RECOMMENDATIONS.md with team
  - [ ] Get stakeholder approval
  - [ ] Assign ownership for each section
  - [ ] Create timeline & milestones

- [ ] **Repository Backup**
  - [ ] Create full backup of current repository
  - [ ] Create git branch: `feature/production-restructure`
  - [ ] Document current structure in reference file

- [ ] **Documentation Review**
  - [ ] Read [PRODUCTION_STRUCTURE_RECOMMENDATIONS.md](PRODUCTION_STRUCTURE_RECOMMENDATIONS.md)
  - [ ] Read [STRUCTURE_COMPARISON.md](STRUCTURE_COMPARISON.md)
  - [ ] Identify gaps specific to your project

---

## 🏗️ Phase 2: Directory Structure Migration (Days 4-8)

### Create New Directory Structure

```bash
# From project root
cd /Users/tranvanhuan/Desktop/ProjectBasedLearning5

# Create main directories
mkdir -p services/{backend,frontend,llm-service,rag-service,worker-service}
mkdir -p infra/{docker,nginx/conf.d,nginx/ssl,kubernetes,scripts,monitoring}
mkdir -p docs/images
mkdir -p .github/workflows
mkdir -p scripts
```

### Step 1: Backend Migration

- [ ] Create `services/backend/` structure
  ```bash
  mkdir -p services/backend/{src,tests,dist}
  mkdir -p services/backend/src/{config,api/v1/{routes,controllers,dto},services,repositories,database/{migrations,seeds},jobs,middlewares,utils,types,common}
  ```

- [ ] Move backend files
  ```bash
  cp -r BE/src/* services/backend/src/ 2>/dev/null || true
  cp BE/package.json services/backend/
  cp BE/tsconfig.json services/backend/
  cp BE/nodemon.json services/backend/
  cp BE/eslint.config.mts services/backend/
  cp BE/.env.example services/backend/ 2>/dev/null || true
  cp BE/Dockerfile services/backend/ 2>/dev/null || true
  cp BE/README.md services/backend/README_OLD.md 2>/dev/null || true
  ```

- [ ] Verify backend migration
  - [ ] Check all files are copied
  - [ ] Update import paths if needed
  - [ ] Test: `cd services/backend && npm install`

### Step 2: Frontend Migration

- [ ] Create `services/frontend/` structure
  ```bash
  mkdir -p services/frontend/{public,src,dist,tests}
  mkdir -p services/frontend/src/{config,layout/components,pages/{auth,dashboard,courses,projects,admin},components/{atoms,molecules,organisms,common},features/{auth,courses,projects,assignments},hooks,services,context,store,routes,styles,utils,types,lib}
  ```

- [ ] Move frontend files
  ```bash
  cp -r FE/client/public/* services/frontend/public/ 2>/dev/null || true
  cp -r FE/client/src/* services/frontend/src/ 2>/dev/null || true
  cp FE/client/package.json services/frontend/
  cp FE/client/tsconfig.json services/frontend/
  cp FE/client/tailwind.config.js services/frontend/
  cp FE/client/postcss.config.js services/frontend/
  cp FE/client/nginx.conf services/frontend/nginx.conf.example
  ```

- [ ] Verify frontend migration
  - [ ] Check all files are copied
  - [ ] Update API endpoints if needed
  - [ ] Test: `cd services/frontend && npm install`

### Step 3: Python Services Migration

- [ ] Reorganize llm-service
  ```bash
  mkdir -p services/llm-service/{src/{config,api/v1/endpoints,core,services,database,schemas,utils,exceptions},tests/{unit,integration},model_cache}
  cp -r llm_service/src/* services/llm-service/src/ 2>/dev/null || true
  cp llm_service/requirements.txt services/llm-service/
  cp llm_service/.env.example services/llm-service/ 2>/dev/null || true
  ```

- [ ] Reorganize rag-service
  ```bash
  mkdir -p services/rag-service/{src,tests,data}
  cp -r RAG/* services/rag-service/src/ 2>/dev/null || true
  ```

- [ ] Reorganize worker-service
  ```bash
  mkdir -p services/worker-service/{src/{config,tasks,processors,services,database,queue,utils,exceptions},tests/{unit,integration},data/{raw_docs,processed}}
  cp -r worker-python/src/* services/worker-service/src/ 2>/dev/null || true
  cp worker-python/requirement.txt services/worker-service/requirements.txt
  cp worker-python/main.py services/worker-service/src/main.py
  ```

### Step 4: Infrastructure Migration

- [ ] Move Docker files
  ```bash
  cp docker-compose.yml infra/docker/docker-compose.yml
  cp docker-compose.prod.yml infra/docker/docker-compose.prod.yml
  mkdir -p infra/docker/mysql infra/docker/redis
  ```

- [ ] Copy/Create Nginx config
  ```bash
  # If backend has nginx config, copy it
  cp services/frontend/nginx.conf.example infra/nginx/frontend.conf
  touch infra/nginx/backend.conf
  touch infra/nginx/nginx.conf
  ```

- [ ] Update docker-compose paths
  - [ ] Update volume mounts to point to new service paths
  - [ ] Update build contexts to `services/*/`
  - [ ] Test: `cd infra/docker && docker-compose config`

---

## 📚 Phase 3: Documentation (Days 9-12)

### Create Core Documentation

- [ ] **Create `docs/ARCHITECTURE.md`**
  - [ ] System overview (diagram: monorepo, services, data flow)
  - [ ] Technology stack
  - [ ] Service interactions
  - [ ] Database design (ER diagram)
  - [ ] API architecture

- [ ] **Create `docs/API_DOCUMENTATION.md`**
  - [ ] Move from `BE/API_DOCUMENTATION.md` if exists
  - [ ] Update with endpoint structure (v1, v2)
  - [ ] Request/Response examples
  - [ ] Authentication details
  - [ ] Error codes & handling

- [ ] **Create `docs/SETUP.md`**
  - [ ] Prerequisites
  - [ ] Local development setup
  - [ ] Database setup
  - [ ] Running each service individually
  - [ ] Common issues & troubleshooting

- [ ] **Create `docs/DEPLOYMENT.md`**
  - [ ] Dev environment deployment
  - [ ] Staging deployment
  - [ ] Production deployment checklist
  - [ ] Rollback procedures
  - [ ] Health checks

- [ ] **Create `docs/DATABASE.md`**
  - [ ] Schema diagram
  - [ ] Migration strategy
  - [ ] Seed data process
  - [ ] Backup & restore procedures

- [ ] **Create `CONTRIBUTING.md`**
  - [ ] Code style guidelines (ESLint, Prettier, Black)
  - [ ] Git workflow (branches, PR process)
  - [ ] Testing requirements (coverage, e2e)
  - [ ] Commit message conventions

- [ ] **Create `CHANGELOG.md`**
  - [ ] Semantic versioning info
  - [ ] Release notes template
  - [ ] Version history

- [ ] **Update `README.md`**
  - [ ] Project overview
  - [ ] Quick start guide
  - [ ] Link to docs folder
  - [ ] Tech stack
  - [ ] Contributing info

---

## 🔧 Phase 4: Configuration Files (Days 13-15)

### Root Level Configurations

- [ ] **Create `.env.example`** (root level)
  ```
  # API Configuration
  BACKEND_URL=http://localhost:3301
  FRONTEND_URL=http://localhost:3000
  
  # Services
  LLM_SERVICE_URL=http://localhost:8000
  RAG_SERVICE_URL=http://localhost:8001
  
  # Common variables
  NODE_ENV=development
  LOG_LEVEL=debug
  ```

- [ ] **Create `.editorconfig`**
  ```
  root = true
  
  [*]
  indent_style = space
  indent_size = 2
  end_of_line = lf
  charset = utf-8
  trim_trailing_whitespace = true
  insert_final_newline = true
  
  [*.md]
  trim_trailing_whitespace = false
  
  [*.py]
  indent_size = 4
  ```

- [ ] **Create `package.json`** (root, monorepo workspace)
  ```json
  {
    "name": "projectbasedlearning5",
    "version": "1.0.0",
    "private": true,
    "workspaces": [
      "services/backend",
      "services/frontend"
    ],
    "scripts": {
      "install-all": "npm install && npm install --workspaces",
      "dev": "npm run dev --workspaces",
      "build": "npm run build --workspaces",
      "test": "npm test --workspaces",
      "lint": "npm run lint --workspaces",
      "format": "prettier --write ."
    }
  }
  ```

- [ ] **Create `tsconfig.json`** (root)
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "lib": ["ES2020"],
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["services/*/src"],
    "exclude": ["node_modules", "dist"]
  }
  ```

- [ ] **Create service-level `.env.example` files**
  - `services/backend/.env.example`
  - `services/frontend/.env.example`
  - `services/llm-service/.env.example`
  - `services/worker-service/.env.example`

---

## ⚙️ Phase 5: Continuous Integration / Deployment (Days 16-18)

### GitHub Actions Workflows

- [ ] **Create `.github/workflows/backend.yml`**
  ```yaml
  name: Backend CI/CD
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - run: cd services/backend && npm install
        - run: cd services/backend && npm run lint
        - run: cd services/backend && npm test
  ```

- [ ] **Create `.github/workflows/frontend.yml`**
  ```yaml
  name: Frontend CI/CD
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - run: cd services/frontend && npm install
        - run: cd services/frontend && npm run lint
        - run: cd services/frontend && npm test
        - run: cd services/frontend && npm run build
  ```

- [ ] **Create `.github/workflows/python-services.yml`**
  ```yaml
  name: Python Services CI/CD
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-python@v4
        - run: pip install -r services/llm-service/requirements.txt
        - run: cd services/llm-service && python -m pytest
  ```

### Git Hooks (Husky)

- [ ] **Setup Husky**
  ```bash
  npm install husky --save-dev
  npx husky install
  npx husky add .husky/pre-commit "npm run lint"
  npx husky add .husky/pre-push "npm test"
  ```

---

## 🧪 Phase 6: Testing Structure (Days 19-20)

### Backend Tests

- [ ] Create test structure
  ```
  services/backend/tests/
  ├── unit/
  │   ├── services/
  │   ├── repositories/
  │   └── utils/
  ├── integration/
  │   ├── api/
  │   └── database/
  └── e2e/
  ```

- [ ] Create Jest config
- [ ] Write sample unit tests
- [ ] Setup test database

### Frontend Tests

- [ ] Create test structure
  ```
  services/frontend/tests/
  ├── unit/
  │   ├── components/
  │   ├── hooks/
  │   └── utils/
  ├── integration/
  └── e2e/
  ```

- [ ] Setup Vitest/Jest
- [ ] Write component tests
- [ ] Setup React Testing Library

### Python Tests

- [ ] Create test structure for each Python service
- [ ] Setup pytest
- [ ] Write unit tests
- [ ] Setup test fixtures

---

## 📊 Phase 7: Deployment Scripts (Days 21-22)

### Create Utility Scripts

- [ ] **`scripts/setup-dev.sh`** - Local environment setup
  ```bash
  #!/bin/bash
  set -e
  
  echo "🚀 Setting up development environment..."
  
  # Install dependencies
  npm install --workspaces
  pip install -r services/llm-service/requirements.txt
  
  # Setup databases
  npm run seed:db
  
  echo "✅ Setup complete!"
  ```

- [ ] **`scripts/seed-data.sh`** - Seed databases
- [ ] **`scripts/backup.sh`** - Database backup
- [ ] **`infra/scripts/deploy.sh`** - Deployment script
- [ ] **`infra/scripts/health-check.sh`** - Health monitoring

---

## 🔐 Phase 8: Environment & Security (Days 23-24)

### Environment Management

- [ ] **Create `.env` files**
  - [ ] `.env.example` (shared template, committed)
  - [ ] `.env.local` (git ignored, local dev)
  - [ ] `.env.staging` (staging credentials)
  - [ ] `.env.production` (git ignored, secrets manager)

- [ ] **Update `.gitignore`**
  ```
  # Environment
  .env
  .env.local
  .env.*.local
  .env.production
  
  # Dependencies
  node_modules/
  __pycache__/
  venv/
  
  # Build
  dist/
  build/
  *.log
  
  # IDE
  .vscode/
  .idea/
  *.swp
  ```

### Security Checklist

- [ ] Validate all secrets are in `.env` (not hardcoded)
- [ ] Setup secrets manager integration (AWS Secrets Manager / Vault)
- [ ] Configure CORS properly
- [ ] Setup rate limiting
- [ ] Enable request logging
- [ ] Setup error tracking (Sentry)

---

## 🎯 Phase 9: Verification & Testing (Days 25-26)

### Full System Test

- [ ] **Local Development**
  - [ ] Start all services: `docker-compose up`
  - [ ] Frontend accessible: http://localhost:3000
  - [ ] Backend accessible: http://localhost:3301
  - [ ] Test main workflows

- [ ] **Database**
  - [ ] Migrations run: `npm run migrate`
  - [ ] Seeds load: `npm run seed`
  - [ ] Data integrity checks

- [ ] **API Testing**
  - [ ] Authentication flow works
  - [ ] CORS configured correctly
  - [ ] Error handling working
  - [ ] API versioning works (v1, v2)

- [ ] **CI/CD Testing**
  - [ ] Push test commit
  - [ ] GitHub Actions triggers
  - [ ] Tests pass
  - [ ] Build succeeds

- [ ] **Documentation**
  - [ ] All docs accessible
  - [ ] Setup guide works
  - [ ] API docs accurate
  - [ ] Deployment docs clear

---

## 📤 Phase 10: Cleanup & Finalization (Days 27-28)

### Remove Old Structures

- [ ] Delete old directories (after verification)
  ```bash
  rm -rf BE FE llm_service RAG worker-python claude
  ```

- [ ] Move old docker files
  ```bash
  rm -f docker-compose.yml docker-compose.prod.yml
  ```

- [ ] Update root level documentation
  ```bash
  rm -f DESIGN.md  # Moved to docs/
  ```

### Final Documentation

- [ ] Update `README.md` with new structure
- [ ] Create migration guide for team
- [ ] Document any breaking changes
- [ ] Update onboarding documentation

### Release & Deployment

- [ ] Create release notes in `CHANGELOG.md`
- [ ] Tag version: `git tag v1.1.0-restructure`
- [ ] Merge to main: `git checkout main && git merge feature/production-restructure`
- [ ] Deploy to production if needed

---

## 📋 Quick Commands Reference

```bash
# Setup
cd /Users/tranvanhuan/Desktop/ProjectBasedLearning5
git checkout -b feature/production-restructure

# Create structure
mkdir -p services/{backend,frontend,llm-service,rag-service,worker-service}
mkdir -p infra/{docker,nginx/conf.d,kubernetes,scripts,monitoring}
mkdir -p docs .github/workflows scripts

# Migrate
cp -r BE services/backend
cp -r FE/client services/frontend
cp -r llm_service services/
cp -r worker-python services/worker-service

# Test
cd services/backend && npm install && npm test
cd ../frontend && npm install && npm test
cd ../llm-service && pip install -r requirements.txt && python -m pytest

# Verify Docker
cd infra/docker
docker-compose config
docker-compose up --build
```

---

## 🎓 Rollback Plan

If issues arise:

```bash
# Undo migration
git checkout feature/production-restructure^1  # Go to commit before migration
git reset --hard origin/main  # Or restore from backup
```

---

## ✅ Final Checklist

- [ ] All files migrated successfully
- [ ] All services can start independently
- [ ] Docker Compose works
- [ ] All tests pass
- [ ] CI/CD pipeline working
- [ ] Documentation complete
- [ ] Team trained on new structure
- [ ] Repository clean (no old folders)
- [ ] Version bumped (e.g., v1.1.0)
- [ ] Tag created and pushed
- [ ] Main branch updated
- [ ] Deployment successful

---

## 🚀 Success Criteria

✅ Project is now production-ready when:
- New developers can onboard in < 1 hour
- Services are independently deployable
- CI/CD runs on every PR
- All tests pass with good coverage
- Monitoring & logging in place
- Disaster recovery procedures documented
- Performance benchmarks established

---

## 📞 Support & Questions

**During Implementation:**
1. Check PRODUCTION_STRUCTURE_RECOMMENDATIONS.md
2. Review STRUCTURE_COMPARISON.md
3. Refer to service-specific README.md files
4. Check GitHub Issues for similar problems

**Post-Implementation:**
1. Monitor CI/CD for failures
2. Gather team feedback
3. Iterate on documentation
4. Plan for scaling

---

**Last Updated**: May 8, 2026  
**Next Review**: After Phase 1 Completion
