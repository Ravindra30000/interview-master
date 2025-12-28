#!/bin/bash

# Deployment Verification Script
# Verifies that the project is ready for deployment

set -e

echo "🔍 InterviewMaster Deployment Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Check Node.js
echo "Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
    
    # Check if version is 20 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        print_success "Node.js version is 20+"
    else
        print_warning "Node.js version should be 20 or higher (current: $NODE_VERSION)"
    fi
else
    print_error "Node.js is not installed"
fi

# Check npm
echo ""
echo "Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed"
fi

# Check dependencies
echo ""
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
else
    print_warning "node_modules not found. Run 'npm install' first"
fi

# Check for package.json
if [ -f "package.json" ]; then
    print_success "package.json exists"
else
    print_error "package.json not found"
fi

# Check environment variables
echo ""
echo "Checking environment variables..."
if [ -f ".env.local" ]; then
    print_success ".env.local file exists"
    
    # Check for required variables
    REQUIRED_VARS=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        "NEXT_PUBLIC_FIREBASE_APP_ID"
        "NEXT_PUBLIC_GEMINI_API_KEY"
    )
    
    MISSING_VARS=0
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env.local; then
            VALUE=$(grep "^${VAR}=" .env.local | cut -d'=' -f2)
            if [ -z "$VALUE" ] || [ "$VALUE" = "your_"* ]; then
                print_warning "$VAR is set but may need a real value"
            else
                print_success "$VAR is set"
            fi
        else
            print_warning "$VAR is missing from .env.local"
            ((MISSING_VARS++))
        fi
    done
    
    if [ $MISSING_VARS -eq 0 ]; then
        print_success "All required environment variables are present"
    fi
else
    print_warning ".env.local not found. Create it from .env.example"
fi

# Check for secrets in code
echo ""
echo "Checking for secrets in code..."
if grep -r "AIzaSy" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ 2>/dev/null | grep -v "NEXT_PUBLIC" > /dev/null; then
    print_error "Potential API keys found in source code"
else
    print_success "No hardcoded API keys found in source code"
fi

# Check Docker
echo ""
echo "Checking Docker..."
if command_exists docker; then
    DOCKER_VERSION=$(docker -v)
    print_success "Docker installed: $DOCKER_VERSION"
else
    print_warning "Docker is not installed (required for Cloud Run deployment)"
fi

# Check Dockerfile
if [ -f "Dockerfile" ]; then
    print_success "Dockerfile exists"
else
    print_error "Dockerfile not found"
fi

# Check cloudbuild.yaml
if [ -f "cloudbuild.yaml" ]; then
    print_success "cloudbuild.yaml exists"
else
    print_warning "cloudbuild.yaml not found (required for Cloud Build)"
fi

# Check gcloud CLI
echo ""
echo "Checking Google Cloud SDK..."
if command_exists gcloud; then
    GCLOUD_VERSION=$(gcloud --version | head -n 1)
    print_success "gcloud CLI installed: $GCLOUD_VERSION"
    
    # Check if authenticated
    if gcloud auth list 2>/dev/null | grep -q "ACTIVE"; then
        print_success "gcloud is authenticated"
    else
        print_warning "gcloud is not authenticated. Run 'gcloud auth login'"
    fi
else
    print_warning "gcloud CLI is not installed (required for Cloud Run deployment)"
fi

# Check TypeScript compilation
echo ""
echo "Checking TypeScript compilation..."
if command_exists npx; then
    if npx tsc --noEmit 2>/dev/null; then
        print_success "TypeScript compilation successful"
    else
        print_error "TypeScript compilation failed"
    fi
else
    print_warning "Cannot check TypeScript (npx not available)"
fi

# Check build
echo ""
echo "Checking Next.js build..."
if [ -d ".next" ]; then
    print_success ".next directory exists (project has been built)"
else
    print_warning ".next directory not found. Run 'npm run build' to test build"
fi

# Check .gitignore
echo ""
echo "Checking .gitignore..."
if [ -f ".gitignore" ]; then
    print_success ".gitignore exists"
    
    # Check for important ignores
    if grep -q "\.env" .gitignore; then
        print_success ".env files are ignored"
    else
        print_warning ".env files should be in .gitignore"
    fi
    
    if grep -q "node_modules" .gitignore; then
        print_success "node_modules is ignored"
    else
        print_warning "node_modules should be in .gitignore"
    fi
else
    print_error ".gitignore not found"
fi

# Check for documentation
echo ""
echo "Checking documentation..."
DOCS=(
    "README.md"
    "PROJECT_SUMMARY.md"
    "TECHNICAL_SPECIFICATION.md"
    "DEMO_VIDEO_SCRIPT.md"
    "SUBMISSION_CHECKLIST.md"
    "FUTURE_SCOPE.md"
)

for DOC in "${DOCS[@]}"; do
    if [ -f "$DOC" ]; then
        print_success "$DOC exists"
    else
        print_warning "$DOC not found"
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "${GREEN}✅ Checks passed: $(( $(echo "$(($ERRORS + $WARNINGS))" | wc -l) - $ERRORS - $WARNINGS + 1))${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 All checks passed! Project is ready for deployment.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Project has warnings but should be deployable.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Project has errors. Please fix them before deploying.${NC}"
    exit 1
fi
