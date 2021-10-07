/*
 * @adonisjs/i18n
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/I18n' {
  import { DateTime } from 'luxon'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  /**
   * Number formatting options
   */
  export type NumberFormatOptions = Intl.NumberFormatOptions & {
    style?: 'decimal' | 'currency' | 'percent' | 'unit'
    unitDisplay?: 'long' | 'short' | 'narrow'
    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero'
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact'
    localeMatcher?: 'best fit' | 'lookup'
    currencySign?: 'accounting' | 'standard'
    currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name'
    compactDisplay?: 'short' | 'long'
  }

  /**
   * Formatting options for the currency formatter. It is
   * a subset of the number formatter
   */
  export type CurrencyFormatOptions = Omit<
    NumberFormatOptions,
    'style' | 'unit' | 'unitDisplay'
  > & {
    // Currency is always required
    currency: string
  }

  /**
   * Formatting options for the time formatter. It is
   * a subset of the date formatter
   */
  export type TimeFormatOptions = Omit<
    Intl.DateTimeFormatOptions,
    'dateStyle' | 'weekday' | 'era' | 'year' | 'month' | 'day' | 'timeZoneName'
  >

  /**
   * Shape of translations
   */
  export type Translations = {
    [lang: string]: Record<string, string>
  }

  /**
   * The loader only needs a single method to load the
   * translations
   */
  export interface LoaderContract {
    load(): Promise<Translations>
  }

  /**
   * Messages formatter formats a string as per the defined
   * specification.
   */
  export interface MessageFormatterContract {
    name: string

    /**
     * Formats a message for the current locale
     */
    format(message: string, locale: string, data: Record<string, any>): string
  }

  /**
   * Shape of the formatter. A given formatter always works with a single
   * locale.
   */
  export interface FormatterContract {
    /**
     * The locale the formatter is working with
     */
    locale: string

    /**
     * Formats a numeric value
     */
    formatNumber(value: string | number | bigint, options?: NumberFormatOptions): string

    /**
     * Formats a numeric value to a currency display value
     */
    formatCurrency(value: string | number, options: CurrencyFormatOptions): string

    /**
     * Formats date, luxon date, ISO date/time string or a timestamp to
     * a formatted date-time string
     */
    formatDate(
      value: string | number | Date | DateTime,
      options?: Intl.DateTimeFormatOptions
    ): string

    /**
     * Formats date, luxon date, ISO date/time string or a timestamp to
     * a formatted time string
     */
    formatTime(value: string | number | Date | DateTime, options?: TimeFormatOptions): string

    /**
     * Format a date, luxon date, ISO date/time string or a diff value
     * to a relative difference string
     */
    formatRelativeTime(
      value: string | number | Date | DateTime,
      unit: Intl.RelativeTimeFormatUnit | 'auto',
      options?: Intl.RelativeTimeFormatOptions
    ): string

    /**
     * Format the value to its plural counter part
     */
    formatPlural(value: string | number, options?: Intl.PluralRulesOptions): string
  }

  /**
   * Config options accepted by the FS loader
   */
  export type FsLoaderOptions = {
    location: string
  }

  /**
   * Config for I18n
   */
  export type I18nConfig = {
    /**
     * Messages format to use. Officially we support
     * ICU only
     */
    messagesFormat: string

    /**
     * Default locale for the application. This locale is
     * used when request locale doesn't fall into the
     * supportLocales list
     */
    defaultLocale: string

    /**
     * If not defined, we will rely on the messages to find the
     * support locales
     */
    supportedLocales?: string[]

    /**
     * Configured loaders
     */
    loaders: {
      fs?: {
        enabled: boolean
      } & FsLoaderOptions
    } & Record<string, { enabled: boolean } & Record<any, any>>
  }

  /**
   * I18n class works with a dedicated locale at a given point
   * in time
   */
  export interface I18nContract extends FormatterContract {
    /**
     * Switch locale for the specific instance
     */
    switchLocale(locale: string): void

    /**
     * Format a message using its identifier. The message from the
     * fallback language is used when the message from current
     * locale is missing.
     */
    formatMessage(identifier: string, data: Record<string, any>): string

    /**
     * Format a raw message
     */
    formatRawMessage(message: string, data: Record<string, any>): string
  }

  /**
   * Shape for the loader extend callback
   */
  export type LoaderExtendCallback = (manager: I18nManagerContract, config: any) => LoaderContract

  /**
   * Shape for the messages formatter extend callback
   */
  export type FormatterExtendCallback = (
    manager: I18nManagerContract,
    config: I18nConfig
  ) => MessageFormatterContract

  /**
   * I18n manager shape
   */
  export interface I18nManagerContract {
    /**
     * Reference to the AdonisJS application
     */
    application: ApplicationContract

    /**
     * Reference to the default locale
     */
    defaultLocale: string

    /**
     * Get instance for a specific locale
     */
    locale(locale: string): I18nContract

    /**
     * An array of locales for which the application has
     * defined messages. These are user defined locales
     * and not normalized "ISO 15897" strings
     */
    supportedLocales(): string[]

    /**
     * Loads messages using the registered loaders. The method
     * returns in a noop after first call. Use "reloadMessages"
     * to force reload
     */
    loadMessages(): Promise<void>

    /**
     * Reloads messages using the registered loaders
     */
    reloadMessages(): Promise<void>

    /**
     * Extend to add custom loaders and formatters
     */
    extend(name: string, type: 'loader', callback: LoaderExtendCallback): void
    extend(name: string, type: 'formatter', callback: FormatterExtendCallback): void
    extend(
      name: string,
      type: 'loader' | 'formatter',
      callback: FormatterExtendCallback | LoaderExtendCallback
    ): void
  }

  const I18n: I18nManagerContract
  export default I18n
}