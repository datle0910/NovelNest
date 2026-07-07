import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import StoryListPage from '../pages/StoryListPage';
import StoryDetailPage from '../pages/StoryDetailPage';
import ReadingPage from '../pages/ReadingPage';
import SearchPage from '../pages/SearchPage';
import CategoryPage from '../pages/CategoryPage';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import FavoritePage from '../pages/FavoritePage';
import ReadingHistoryPage from '../pages/ReadingHistoryPage';
import ProfilePage from '../pages/ProfilePage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import VerifyOtpPage from '../pages/VerifyOtpPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import PrivateRoute from '../components/PrivateRoute';

import AdminLayout from '../layouts/AdminLayout';
import AdminRoute from '../components/AdminRoute';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import StoryManagementPage from '../pages/admin/StoryManagementPage';
import StoryFormPage from '../pages/admin/StoryFormPage';
import ChapterManagementPage from '../pages/admin/ChapterManagementPage';
import ChapterFormPage from '../pages/admin/ChapterFormPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import AuthorManagementPage from '../pages/admin/AuthorManagementPage';
import ImportDataPage from '../pages/admin/ImportDataPage';
import AdminReportPage from '../pages/admin/AdminReportPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="forgot-password/verify" element={<VerifyOtpPage />} />
        <Route path="forgot-password/reset" element={<ResetPasswordPage />} />
        <Route path="stories" element={<StoryListPage />} />
        <Route path="stories/:slug" element={<StoryDetailPage />} />
        <Route path="stories/:slug/chapters/:chapterNumber" element={<ReadingPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="categories/:categorySlug" element={<CategoryPage />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="favorites" element={<FavoritePage />} />
          <Route path="reading-history" element={<ReadingHistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="stories" element={<StoryManagementPage />} />
          <Route path="stories/create" element={<StoryFormPage />} />
          <Route path="stories/edit/:id" element={<StoryFormPage />} />
          <Route path="stories/:storyId/chapters" element={<ChapterManagementPage />} />
          <Route path="stories/:storyId/chapters/create" element={<ChapterFormPage />} />
          <Route path="chapters/edit/:id" element={<ChapterFormPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="authors" element={<AuthorManagementPage />} />
          <Route path="reports" element={<AdminReportPage />} />
          <Route path="import" element={<ImportDataPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
