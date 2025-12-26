/**
 * Form Extractor
 * Extracts form information from HTML and detects vulnerability indicators
 * Based on form-security-analyzer logic
 */

import * as cheerio from 'cheerio';
import type { FormInfo, FormField } from '../types.js';

export class FormExtractor {
  /**
   * Extract all forms from HTML
   * @param html - HTML content
   * @param pageUrl - URL of the page
   * @returns Array of form information
   */
  extract(html: string, pageUrl: string): FormInfo[] {
    const $ = cheerio.load(html);
    const forms: FormInfo[] = [];

    $('form').each((_, element) => {
      const $form = $(element);

      const action = $form.attr('action') || '';
      const method = ($form.attr('method') || 'GET').toUpperCase();

      // Extract fields
      const fields: FormField[] = [];
      $form.find('input, textarea, select').each((_, input) => {
        const $input = $(input);
        const name = $input.attr('name') || '';
        const type = $input.attr('type') || 'text';
        const required = $input.attr('required') !== undefined;

        if (name) {
          fields.push({ name, type, required });
        }
      });

      // Resolve action URL
      let actionUrl = action;
      try {
        actionUrl = new URL(action || pageUrl, pageUrl).href;
      } catch {
        actionUrl = pageUrl;
      }

      // Check for CSRF token
      const csrfToken = this.detectCSRFToken($form);

      // Detect vulnerability indicators
      const vulnerabilityIndicators = this.detectVulnerabilities(
        $form,
        method,
        actionUrl,
        csrfToken
      );

      forms.push({
        url: pageUrl,
        action: actionUrl,
        method,
        fields,
        csrfToken,
        vulnerabilityIndicators,
      });
    });

    return forms;
  }

  /**
   * Detect CSRF token in form
   * @param $form - Cheerio form element
   * @returns true if CSRF token found
   */
  private detectCSRFToken($form: cheerio.Cheerio<any>): boolean {
    const csrfPatterns = [
      'csrf',
      'token',
      'xsrf',
      '_token',
      'authenticity_token',
      'anti_csrf',
    ];

    let found = false;

    $form.find('input[type="hidden"]').each((_, input) => {
      const name = $(input).attr('name')?.toLowerCase() || '';
      for (const pattern of csrfPatterns) {
        if (name.includes(pattern)) {
          found = true;
          return false; // break loop
        }
      }
    });

    return found;
  }

  /**
   * Detect vulnerability indicators
   * @param $form - Cheerio form element
   * @param method - HTTP method
   * @param actionUrl - Form action URL
   * @param csrfToken - Whether CSRF token is present
   * @returns Array of vulnerability indicators
   */
  private detectVulnerabilities(
    $form: cheerio.Cheerio<any>,
    method: string,
    actionUrl: string,
    csrfToken: boolean
  ): string[] {
    const indicators: string[] = [];

    // Missing CSRF token on state-changing forms
    if (method === 'POST' && !csrfToken) {
      indicators.push('missing-csrf');
    }

    // HTTP action URL (insecure)
    if (actionUrl.startsWith('http://')) {
      indicators.push('http-action');
    }

    // State-changing GET request
    if (method === 'GET') {
      // Check for password or sensitive fields
      $form.find('input').each((_, input) => {
        const type = $(input).attr('type') || '';
        const name = $(input).attr('name')?.toLowerCase() || '';

        if (
          type === 'password' ||
          name.includes('password') ||
          name.includes('secret') ||
          name.includes('token')
        ) {
          indicators.push('state-changing-get');
          return false; // break
        }
      });
    }

    // Password field with autocomplete
    $form.find('input[type="password"]').each((_, input) => {
      const autocomplete = $(input).attr('autocomplete');
      if (autocomplete !== 'off' && autocomplete !== 'new-password') {
        indicators.push('password-autocomplete');
        return false; // break
      }
    });

    // Hidden fields with sensitive data patterns
    $form.find('input[type="hidden"]').each((_, input) => {
      const name = $(input).attr('name')?.toLowerCase() || '';
      const value = $(input).attr('value') || '';

      if (
        (name.includes('id') || name.includes('userid')) &&
        /^\d+$/.test(value)
      ) {
        indicators.push('predictable-id');
        return false; // break
      }
    });

    return indicators;
  }

  /**
   * Estimate bounty potential based on vulnerability indicators
   * @param vulnerabilityIndicators - Array of indicators
   * @returns Bounty potential level
   */
  estimateBountyPotential(
    vulnerabilityIndicators: string[]
  ): 'high' | 'medium' | 'low' {
    const highPriority = ['missing-csrf', 'http-action', 'predictable-id'];
    const mediumPriority = ['state-changing-get', 'password-autocomplete'];

    for (const indicator of vulnerabilityIndicators) {
      if (highPriority.includes(indicator)) {
        return 'high';
      }
    }

    for (const indicator of vulnerabilityIndicators) {
      if (mediumPriority.includes(indicator)) {
        return 'medium';
      }
    }

    return 'low';
  }
}
