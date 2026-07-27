# 🏠 MingecevirEmlak.az — Real Estate Management Platform

A full-stack real estate platform designed and developed from scratch for the city of Mingachevir, Azerbaijan. The platform enables real estate agencies to publish and manage property listings, while providing a modern, user-friendly experience for customers searching for apartments, houses, commercial properties, land, and rental offers.

**Live Site:** [mingaceviremlak.az](https://mingaceviremlak.az)

---

## 📋 Overview

The project consists of two independent Angular frontend applications (public website and administration panel), a Java Spring Boot backend, a PostgreSQL database, Dockerized infrastructure, and an Nginx reverse proxy. It follows a layered, modular architecture designed to be scalable, maintainable, and easy to extend with new business requirements.

---

## ✨ Main Features

### Public Website
- Browse all available property listings
- Advanced search and filtering (price, property type, rooms, district, area, sale/rent, building type, floor, and more)
- Property detail pages with high-quality image galleries and video support
- Responsive design for desktop and mobile
- SEO-friendly URLs and fast page loads
- Pagination and contact info for each listing

### Administration Panel
- Secure authentication & role-based authorization
- Full property management (CRUD)
- Multi-image and video upload for listings
- Category, district, and property type management
- Listing activation/deactivation and featured property management
- Dashboard statistics and user management
- Search, filtering, sorting, and business rule validation

### Backend
- RESTful API architecture (auth, properties, images, categories, districts, search, filtering, pagination)
- File and video upload handling
- Exception handling, logging, and configuration management
- Layered architecture: **Controller → Service → Repository → PostgreSQL**

### Security
- Spring Security with JWT authentication
- Role-based authorization
- BCrypt password encryption
- Input validation and protected REST endpoints

---

## 🛠️ Tech Stack

**Backend**
Java · Spring Boot · Spring MVC · Spring Security · Spring Data JPA · Hibernate · Maven · JWT · Lombok · Bean Validation

**Frontend**
Angular · TypeScript · HTML5 · CSS3 · Bootstrap · Nebular UI · RxJS

**Database**
PostgreSQL

**Infrastructure**
Docker · Docker Compose · Nginx

**Tools**
Git · GitHub · IntelliJ IDEA · VS Code · Postman

---

## 🏗️ Architecture

```
Controller Layer
      ↓
Service Layer
      ↓
Repository Layer
      ↓
PostgreSQL Database
```

This separation improves maintainability, testability, scalability, and readability across the codebase.

---

## 🚀 Deployment

The entire application is containerized and deployed using Docker Compose, orchestrating the following services:

- PostgreSQL container
- Spring Boot backend container
- Angular public website container
- Angular admin panel container
- Nginx reverse proxy container

Nginx handles reverse proxying, static file serving, request routing, and frontend/backend communication (SSL-ready).

---

## 📈 Scalability Considerations

- Modular backend architecture
- Stateless REST APIs
- Optimized, indexed database queries
- Ready for cloud migration (AWS/Azure/GCP)
- Easy integration with external services

---

## 👤 My Role

As the sole developer on this project, I was responsible for the full software development lifecycle:

- Requirements analysis & system architecture design
- Database modeling (PostgreSQL)
- Backend development (Java/Spring Boot)
- Frontend development (public website + admin panel, Angular)
- REST API design and implementation
- Authentication & authorization
- Docker containerization and Nginx configuration
- Database optimization, testing, debugging, and deployment
- Ongoing maintenance and feature development

---

## 📄 License

This project was developed as a freelance engagement. Code is available for review upon request.
