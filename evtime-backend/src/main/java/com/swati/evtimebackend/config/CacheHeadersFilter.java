package com.swati.evtimebackend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Lets browsers and CDNs cache the public list endpoints for a short time.
 * Article reads (/api/news/{id}) are not cached so that view counts stay accurate.
 */
@Component
public class CacheHeadersFilter extends OncePerRequestFilter {

    private static final Map<String, String> RULES = Map.of(
            "/api/news", "public, max-age=30, stale-while-revalidate=60",
            "/api/news/featured", "public, max-age=30, stale-while-revalidate=60",
            "/api/news/trending", "public, max-age=60, stale-while-revalidate=120",
            "/api/news/categories", "public, max-age=300",
            "/api/news/latest", "public, max-age=10",
            "/sitemap.xml", "public, max-age=900",
            "/rss.xml", "public, max-age=300");

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"GET".equals(request.getMethod()) || !RULES.containsKey(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader("Cache-Control", RULES.get(request.getRequestURI()));
        chain.doFilter(request, response);
    }
}
