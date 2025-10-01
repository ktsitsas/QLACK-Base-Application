package com.eurodyn.qlack.baseapplication.config;

import com.eurodyn.qlack.util.csrf.filter.CustomCookieFilter;
import com.eurodyn.qlack.util.jwt.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
public class WebSecurityConfig {

    @Value("${qlack.util.csrf.ignore-paths:#{null}}")
    private List<String> IGNORED_PATHS;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final CustomCookieFilter customCookieFilter;

    public WebSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CustomCookieFilter customCsrfCookieFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customCookieFilter = customCsrfCookieFilter;
    }

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {
        final String[] PUBLIC_URIS = IGNORED_PATHS!=null ? IGNORED_PATHS.toArray(new String[IGNORED_PATHS.size()]) : new String[0];
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(requests -> requests
                .requestMatchers(PUBLIC_URIS).permitAll()
                .anyRequest().authenticated())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(customCookieFilter, BasicAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
