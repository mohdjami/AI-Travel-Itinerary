# 🌍 AI Travel Itinerary Generator

<div align="center">

[![Live Demo](https://img.shields.io/badge/demo-live-green?style=for-the-badge)](https://travelplanai.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/github-repo-blue?style=for-the-badge&logo=github)](https://github.com/mohdjami/AI-Travel-Itinerary)
[![Watch Demo](https://img.shields.io/badge/youtube-demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/oeioDsKQ4cQ)

Generate personalized travel itineraries powered by AI using Next.js, Supabase, and Google's Gemini 1.5

</div>

## 🚀 Features

- **AI-Powered Itineraries**: Leverages Google's Gemini-1.5-flash model for intelligent travel planning
- **Interactive Maps**: Visual representation of activities using Leaflet Maps API
- **Credit System**: 5 free credits upon registration for itinerary generation
- **Export Options**: Download itineraries in PDF or TXT format
- **User Dashboard**: Manage and view recent travel plans
- **Authentication**: Secure login with GitHub OAuth or email credentials

## 🏗️ Architecture

![Application Architecture](https://prod-files-secure.s3.us-west-2.amazonaws.com/32c8d686-cb3a-45e8-9bfc-53380f009e76/0c41fed0-a76f-4fe0-bd3e-8d4aa5e4df81/diagram-export-24-9-2024-8_43_41-pm.png)

### Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Shadcn
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Model**: Google Gemini-1.5-flash
- **Queue System**: Qstash
- **Maps**: Leaflet Maps API

## 📊 Database Schema

![ERD Diagram](https://prod-files-secure.s3.us-west-2.amazonaws.com/32c8d686-cb3a-45e8-9bfc-53380f009e76/e44ab66d-c9d7-4f50-88c0-840167748223/diagram-export-25-9-2024-12_19_01-pm.png)

## 🚦 Getting Started

1. **Register an Account**
   ```bash
   https://travelplanai.vercel.app/signup
   ```

2. **Generate Itinerary**
   - Fill out the travel preferences form
   - Click "Generate" button
   - Wait for AI to create your personalized itinerary

3. **View & Export**
   - See your itinerary with mapped locations
   - Download in PDF or TXT format
   - Access past itineraries from dashboard

## 💡 Implementation Details

### Authentication Flow
- **Supabase Integration**
  - Centralized auth and data storage
  - Built on PostgreSQL
  - Row Level Security (RLS) policies
  
- **Multiple Auth Methods**
  - GitHub OAuth
  - Email/Password credentials
  - Automatic user creation in database

### Itinerary Generation Process
1. User submits preferences
2. Backend creates personalized prompt
3. Gemini AI generates itinerary
4. Response is parsed and stored
5. Maps are generated using coordinates
6. Credit is deducted from user account

### Queue System (Qstash)
- Handles non-critical tasks asynchronously
- Improves response times
- Manages credit updates and data storage

## 🔄 Current Limitations & Future Improvements

### Limitations
- Long response time for itinerary generation
- No fallback mechanism for failed generations
- Disabled RLS policies temporarily

### Planned Improvements
1. **Performance Optimization**
   - Implement response caching
   - Optimize database queries
   - Add request fallback mechanisms

2. **Feature Additions**
   - Credit purchase system
   - Enhanced user profile management
   - Image upload capability

3. **Technical Improvements**
   - Re-enable RLS policies
   - Implement comprehensive error handling
   - Add request retry mechanism

## 🐳 Deployment

Currently deployed on Vercel for demonstration purposes.

**Production-Ready Setup**:
- Dockerized application
- Ready for AWS Elastic Container Service
- Configured for auto-scaling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

## 👨‍💻 Author

**Mohd Jami Khan**
- GitHub: [@mohdjami](https://github.com/mohdjami)
- LinkedIn: [Mohd Jami Khan](https://linkedin.com/in/mohdjami)

---

<div align="center">
⭐️ Star this repo if you find it helpful! ⭐️
</div>
