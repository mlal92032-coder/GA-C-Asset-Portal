---
name: database-schema
description: Review, explain, and optimize the Prisma database schema. Use when understanding data relationships or planning new database features.
---

# Database Schema

## Instructions

### Step 1: Read Prisma Schema
- Open `prisma/schema.prisma`
- Identify all models and their fields
- Note relationships: one-to-one, one-to-many, many-to-many
- Check for indexes and constraints

### Step 2: Understand Data Relationships
- Create relationship diagram (mental model)
- Document foreign keys and references
- Explain cascade behaviors (onDelete, onUpdate)
- Note composite keys if any

### Step 3: Analyze Model Structure
For each model, document:
- **Fields**: Name, type, constraints (unique, required, default)
- **Relations**: How it connects to other models
- **Indexes**: Performance optimization indexes
- **Enums**: If using enum fields

### Step 4: Check Best Practices
- Verify timestamps (createdAt, updatedAt) are present
- Check for soft deletes where needed
- Verify relationships are properly defined
- Look for n+1 query problems

### Step 5: Suggest Optimizations
- Recommend missing indexes on frequently queried fields
- Suggest denormalization if needed for performance
- Identify missing constraints (unique, required)
- Recommend relationship structure improvements

### Step 6: Generate Migration (if needed)
- Update `prisma/schema.prisma` with changes
- Run: `npx prisma migrate dev --name [migration_name]`
- Review migration SQL in `prisma/migrations/`
- Test migration: `npx prisma db push`

### Step 7: Update Seed Data
- Add sample data for new models in `prisma/seed.ts`
- Run: `npx prisma db seed`
- Verify data integrity

### Step 8: Document Schema
- Create `docs/SCHEMA.md` with ER diagram
- Document business rules per model
- Explain relationships and constraints
- Include usage examples

