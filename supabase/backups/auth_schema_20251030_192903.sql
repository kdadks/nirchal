--
-- PostgreSQL database dump
--

\restrict u3Kf0UMcRU71uxNALeywtGK0vquAEB0uUVbbCDOCZNifLKgVTfcKtsHAqXOtneZ

-- Dumped from database version 15.8
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	1caf0855-4c90-4012-b17c-532bab751b13	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"amit.ranjan78@gmail.com","user_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","user_phone":""}}	2025-05-30 12:33:52.106496+00	
00000000-0000-0000-0000-000000000000	415bb70e-e7cc-47d7-bf20-fdf6efbe037c	{"action":"login","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 14:30:34.853938+00	
00000000-0000-0000-0000-000000000000	f873b96b-5d2b-4170-8e29-fa74941f47c5	{"action":"login","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-30 14:31:19.740528+00	
00000000-0000-0000-0000-000000000000	77bc01a8-02b8-49b8-b92c-98b2224b2dbf	{"action":"logout","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-30 14:35:10.631977+00	
00000000-0000-0000-0000-000000000000	f39e6468-9a9b-4b0c-81d6-1cf711e97e5c	{"action":"login","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 06:42:51.01124+00	
00000000-0000-0000-0000-000000000000	f9f15538-6402-4160-8b3c-1ad07dd3e0ae	{"action":"login","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-05-31 06:42:54.021466+00	
00000000-0000-0000-0000-000000000000	d95ddc2a-e5ea-4c6f-aa02-88be5282eb9b	{"action":"logout","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-05-31 06:43:04.206657+00	
00000000-0000-0000-0000-000000000000	1ff8ef45-a053-4c25-9782-9dd67a4992e3	{"action":"login","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-29 14:46:11.493658+00	
00000000-0000-0000-0000-000000000000	d4bee0de-c570-4b44-bc83-79467fea793e	{"action":"token_refreshed","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 06:01:05.895834+00	
00000000-0000-0000-0000-000000000000	a2e04d59-7852-463a-8119-115add432b8f	{"action":"token_revoked","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 06:01:05.92285+00	
00000000-0000-0000-0000-000000000000	fda61bc4-ad1d-4614-9e61-efa256cbe673	{"action":"token_refreshed","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 06:59:15.062495+00	
00000000-0000-0000-0000-000000000000	0a067be2-bc52-4935-91a9-4868eabb69b9	{"action":"token_revoked","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 06:59:15.070679+00	
00000000-0000-0000-0000-000000000000	21637d4f-f264-4b08-890d-45886cd29d92	{"action":"token_refreshed","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 07:57:54.820765+00	
00000000-0000-0000-0000-000000000000	36bf1971-6ace-4b61-9031-6160dcfb9128	{"action":"token_revoked","actor_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","actor_username":"amit.ranjan78@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 07:57:54.837224+00	
00000000-0000-0000-0000-000000000000	4c652910-e289-472f-9177-8fb1fb3f2aa6	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"amit.ranjan78@gmail.com","user_id":"9b383ba5-87d1-441c-af2a-a2281ce6252f","user_phone":""}}	2025-08-06 08:48:43.30814+00	
00000000-0000-0000-0000-000000000000	9b96a481-4073-4eff-a12e-a188a945db44	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@kdadks.com","user_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","user_phone":""}}	2025-08-06 08:49:04.024773+00	
00000000-0000-0000-0000-000000000000	1ed485cd-5463-446c-a3e4-9f2a53ff503e	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 08:49:19.166089+00	
00000000-0000-0000-0000-000000000000	f799ff72-816f-447c-b104-131390679109	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 08:54:48.467466+00	
00000000-0000-0000-0000-000000000000	19fd162e-a912-4786-a3e5-5b84d702d55d	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 08:55:19.466236+00	
00000000-0000-0000-0000-000000000000	1164803c-567e-40c6-98c1-68574ffc1e14	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 08:59:16.758958+00	
00000000-0000-0000-0000-000000000000	38809b72-335e-4e5c-bbf7-a81229669571	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 08:59:18.705377+00	
00000000-0000-0000-0000-000000000000	92b164ee-595e-4eb9-933a-664d07002243	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 09:04:19.689075+00	
00000000-0000-0000-0000-000000000000	fd8b50df-1d86-49e4-9af5-0995f0309af8	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 09:04:32.884621+00	
00000000-0000-0000-0000-000000000000	a8648302-c0af-4e13-8e20-9c5c787a6c7f	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 09:04:41.941546+00	
00000000-0000-0000-0000-000000000000	d75088b5-723f-4dbc-9da9-f07c21eb493c	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 09:08:32.80592+00	
00000000-0000-0000-0000-000000000000	a679cbba-3682-4916-a31a-7620cd896236	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 09:13:44.798211+00	
00000000-0000-0000-0000-000000000000	7cfef381-a03d-4112-9761-7a315e7c2e38	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 10:28:20.246051+00	
00000000-0000-0000-0000-000000000000	a881563d-7a08-4d5c-97ac-af5fa23c6b3f	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 10:28:20.2584+00	
00000000-0000-0000-0000-000000000000	e6d1ba4c-7f92-446b-8756-1ce8f32d0712	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 10:29:24.758443+00	
00000000-0000-0000-0000-000000000000	92b18cb3-bdae-4130-9421-f007664c24b3	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 10:30:49.128011+00	
00000000-0000-0000-0000-000000000000	1e9aead1-cee6-402e-8497-93a8467cbbc2	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 10:30:59.367357+00	
00000000-0000-0000-0000-000000000000	6c0312c6-0ba8-410d-9a6e-942a98869280	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 10:33:37.543043+00	
00000000-0000-0000-0000-000000000000	5c23f7b6-bb8c-450a-9719-1c8d356af866	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 11:32:44.720753+00	
00000000-0000-0000-0000-000000000000	936e2f66-37c3-4381-a3aa-c667ad761ca0	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-06 11:32:44.739901+00	
00000000-0000-0000-0000-000000000000	1169a007-6b69-411c-b6fe-9b522106b505	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 11:34:14.684834+00	
00000000-0000-0000-0000-000000000000	f0838488-e97a-455f-99b0-1a46183611da	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 11:34:17.694699+00	
00000000-0000-0000-0000-000000000000	832820e3-3fcf-4725-9003-31e5477fba2a	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 11:38:48.954134+00	
00000000-0000-0000-0000-000000000000	e77e3e59-3edc-45a4-9353-8689a2251536	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 11:43:06.583562+00	
00000000-0000-0000-0000-000000000000	4c9c1e89-0363-4d22-994d-15daee6d2ea0	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 11:46:11.591491+00	
00000000-0000-0000-0000-000000000000	3d8b9520-67c6-4ed6-baf2-671a1eef0a9c	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 11:49:02.641105+00	
00000000-0000-0000-0000-000000000000	9cf04028-c3c1-45ff-b70a-13db7e016cb4	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:27:54.630559+00	
00000000-0000-0000-0000-000000000000	319cbdc1-fbf8-4416-9667-29fe5172f5b5	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:35:04.897475+00	
00000000-0000-0000-0000-000000000000	c4f1b94d-4643-4ec9-9a3c-bb398fb105cd	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:40:29.032063+00	
00000000-0000-0000-0000-000000000000	585e7b1c-9ef7-45bf-b0d2-741a5785b34b	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 12:45:09.415289+00	
00000000-0000-0000-0000-000000000000	59a7e211-ee67-4c29-af98-ca2d3d596f3b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:45:17.246058+00	
00000000-0000-0000-0000-000000000000	806a2cb2-7d78-4181-aef3-55bfaac1dc93	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 12:48:56.819392+00	
00000000-0000-0000-0000-000000000000	8f33dc1b-d99f-46a1-bce7-a9a56d0a33db	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:49:10.008585+00	
00000000-0000-0000-0000-000000000000	9ea38c3d-3ec2-4743-8b53-d174343d0696	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 12:50:44.09282+00	
00000000-0000-0000-0000-000000000000	a3a129b7-c3c9-49f5-accf-cbebc928c9cb	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:50:51.680882+00	
00000000-0000-0000-0000-000000000000	b57dd161-abe4-4d0f-81be-d6782be025fa	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 12:53:48.414762+00	
00000000-0000-0000-0000-000000000000	5d802255-04a2-4aa2-85b0-b96eab5562f6	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:53:53.638244+00	
00000000-0000-0000-0000-000000000000	9a3c8893-b531-4648-b7c5-d72845b8e9ce	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 12:54:51.807332+00	
00000000-0000-0000-0000-000000000000	5adabab7-5a56-43ce-afdd-236658b9fcdf	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 12:56:40.580166+00	
00000000-0000-0000-0000-000000000000	0c9ca998-f394-4b1e-abee-9e0482e40fa6	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 13:00:02.273977+00	
00000000-0000-0000-0000-000000000000	621b6eb2-3e11-4e17-8a96-3a83c52f97f2	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 13:00:08.762162+00	
00000000-0000-0000-0000-000000000000	b080edf5-44bc-4b65-9a30-12df9c8471e3	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 13:12:15.418804+00	
00000000-0000-0000-0000-000000000000	a10be229-c95a-4f3e-bdc0-a2ffd9a03ec3	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-06 13:12:22.804578+00	
00000000-0000-0000-0000-000000000000	9b536fd8-0704-4bae-b3b6-50649fe21b69	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-06 13:18:18.315851+00	
00000000-0000-0000-0000-000000000000	1e8c50dc-169c-4d01-ae57-5139950f21da	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:01:55.58903+00	
00000000-0000-0000-0000-000000000000	6bc526ba-fb33-40f8-b4ef-bc39ab28dcef	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:24:11.063052+00	
00000000-0000-0000-0000-000000000000	807f1791-c43b-4d5a-8387-f2d06c16ca25	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:27:18.686051+00	
00000000-0000-0000-0000-000000000000	c1bde2fa-228a-4a01-a4fb-c8a3b325603c	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:28:28.325696+00	
00000000-0000-0000-0000-000000000000	e2cbd6d5-a331-4370-90a6-795b9f212259	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:29:18.242629+00	
00000000-0000-0000-0000-000000000000	f4b61cb2-7da4-47df-9ad4-98a9e9539e15	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:30:30.471562+00	
00000000-0000-0000-0000-000000000000	2fa9a0af-ca6c-4f49-861b-cc9a73c67635	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:53:23.671124+00	
00000000-0000-0000-0000-000000000000	471726c3-c94b-48ac-a28c-b71df5fe3eb6	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 06:58:34.034747+00	
00000000-0000-0000-0000-000000000000	2d961b48-1dec-4cc7-b94d-89d4714dfc9b	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 07:00:40.568751+00	
00000000-0000-0000-0000-000000000000	b4816860-75cf-4a69-b0d7-56e823397a9b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:00:54.352846+00	
00000000-0000-0000-0000-000000000000	f2f95c27-f84b-4076-b20d-aa7168ece686	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:05:27.889245+00	
00000000-0000-0000-0000-000000000000	7f2615c3-627e-488e-a8f9-961e0d4c220b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:06:13.660878+00	
00000000-0000-0000-0000-000000000000	738e171f-ffb0-421c-aff3-d0bb6cbb54d2	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:06:41.003467+00	
00000000-0000-0000-0000-000000000000	9c4ae450-4e4b-4f53-bdfb-c22278411011	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 07:09:40.698383+00	
00000000-0000-0000-0000-000000000000	c16f6eb0-8039-4f2c-b1c0-71d44e497e9e	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:09:46.137013+00	
00000000-0000-0000-0000-000000000000	8a52cd5e-7245-418a-a446-cfbbd66ebd49	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:10:01.324241+00	
00000000-0000-0000-0000-000000000000	5ed69966-e91d-49a7-97b2-87bded940348	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:14:18.995925+00	
00000000-0000-0000-0000-000000000000	0571e77c-37a0-4264-b9ae-f7989ccd62c9	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:16:34.53472+00	
00000000-0000-0000-0000-000000000000	f2a87c8e-a4ba-46d8-9793-1453d9186a95	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 07:24:53.974712+00	
00000000-0000-0000-0000-000000000000	9c5b01d7-98a9-40fb-a643-bb7467dd530b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:25:00.692132+00	
00000000-0000-0000-0000-000000000000	51577071-5670-4289-92d9-1095610b8c78	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:25:09.874046+00	
00000000-0000-0000-0000-000000000000	2522ebbb-5a9e-4a10-b7df-31d59e262c97	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:36:23.930349+00	
00000000-0000-0000-0000-000000000000	8517ee0f-63be-4359-9cc2-d36871ddc562	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:45:13.32643+00	
00000000-0000-0000-0000-000000000000	b6b6c2c5-b279-4a3d-b3a1-3f5a7b913b8a	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 07:49:50.31357+00	
00000000-0000-0000-0000-000000000000	2ce567fe-6df3-4569-9f57-23f99e016a2c	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:49:53.261061+00	
00000000-0000-0000-0000-000000000000	c3341854-30d4-42ad-b655-415490cb6f7a	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 07:50:43.637553+00	
00000000-0000-0000-0000-000000000000	071bc728-1982-4cb6-87c3-70a06828f3c8	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:50:45.165164+00	
00000000-0000-0000-0000-000000000000	16d92693-fc30-49d0-b954-d7531b1766a6	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 07:50:59.324273+00	
00000000-0000-0000-0000-000000000000	304dc984-d14f-42f9-952d-16ccdf46f619	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 08:49:39.89924+00	
00000000-0000-0000-0000-000000000000	b45f67f5-ad46-4cea-92d7-0ca6ce4af1fd	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 08:49:39.908568+00	
00000000-0000-0000-0000-000000000000	8051915f-584d-429d-a17f-5da4b4abea8c	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 08:50:45.375766+00	
00000000-0000-0000-0000-000000000000	2f6afd61-78cf-4a4b-99bf-5ead92d9d38f	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 08:50:49.666599+00	
00000000-0000-0000-0000-000000000000	44fb69e7-21ff-42e0-b322-659457feb6b3	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 08:53:39.268555+00	
00000000-0000-0000-0000-000000000000	fb4ecd54-22d6-4841-81c1-f8b9aad70bf9	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 08:53:41.026463+00	
00000000-0000-0000-0000-000000000000	ff2286f9-67f8-4501-8c08-27e4495733b9	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 09:03:57.29198+00	
00000000-0000-0000-0000-000000000000	b2fd2709-5448-433d-b29a-fd6b7e2b4958	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 10:02:09.942689+00	
00000000-0000-0000-0000-000000000000	1a72d0d5-b061-4e3c-91e6-25e5b7e5ec58	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 10:02:09.965448+00	
00000000-0000-0000-0000-000000000000	667434cd-4769-482f-8e0f-f13a03f1a623	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 10:11:31.595078+00	
00000000-0000-0000-0000-000000000000	7d97e049-433f-48f5-a7c0-efbf4853e026	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:11:37.889087+00	
00000000-0000-0000-0000-000000000000	ad98b4cb-f80c-4ccb-b507-6e47ca803fad	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 10:12:39.752875+00	
00000000-0000-0000-0000-000000000000	13d73434-827e-4e0c-ab9a-cb698ab09fa5	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:12:44.247867+00	
00000000-0000-0000-0000-000000000000	07c182d0-b5fc-4a8d-acf5-f33368f0358b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:12:51.27242+00	
00000000-0000-0000-0000-000000000000	60febbab-1229-46e8-984b-6bbe88c47236	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:51:11.969066+00	
00000000-0000-0000-0000-000000000000	b7d4347c-cd7c-40b2-b1ca-89a935dc9cd3	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 10:52:56.646521+00	
00000000-0000-0000-0000-000000000000	18eabbf4-4576-410a-99f6-ced9870525d8	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:53:00.98187+00	
00000000-0000-0000-0000-000000000000	17340944-83d3-40b7-ac66-cbab3c9c1516	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:55:20.580489+00	
00000000-0000-0000-0000-000000000000	a0efd165-327b-4014-af95-a7d4f61c0fb4	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 10:55:24.870387+00	
00000000-0000-0000-0000-000000000000	bf99b196-0663-46da-a98c-4908cfda70ec	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 10:55:51.761903+00	
00000000-0000-0000-0000-000000000000	024d3571-f64a-4c5c-b8e1-bba96ba8f874	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 11:13:48.760842+00	
00000000-0000-0000-0000-000000000000	b80dfe99-9ef5-4a1f-8312-84717f9b7677	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 11:13:50.475837+00	
00000000-0000-0000-0000-000000000000	43ef4bcd-69e1-48d7-8092-c2a226441345	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 11:17:48.927044+00	
00000000-0000-0000-0000-000000000000	7af6ab9a-7a16-4243-8d32-641dc48c1a48	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 11:22:42.90288+00	
00000000-0000-0000-0000-000000000000	3e3eafc4-2709-4e6a-8da7-92625cbf567c	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 11:31:58.40633+00	
00000000-0000-0000-0000-000000000000	7752e262-6b79-4cb5-b0a0-4911bbb17fee	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 11:32:00.042666+00	
00000000-0000-0000-0000-000000000000	d0320982-001f-4f19-a2b2-95b583bcfbbf	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 12:03:51.070117+00	
00000000-0000-0000-0000-000000000000	d3bfd1af-e126-4b07-b786-0c1fa8e9fdca	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 13:02:11.011915+00	
00000000-0000-0000-0000-000000000000	61eb217f-2e11-4be4-9e27-28d6859e9cfd	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 13:02:11.03389+00	
00000000-0000-0000-0000-000000000000	939d45e9-db56-41c8-ae0c-68bb648b680c	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 13:48:19.177608+00	
00000000-0000-0000-0000-000000000000	bce57482-081d-4cf8-b03f-8691ed606c89	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 13:48:26.29227+00	
00000000-0000-0000-0000-000000000000	c1b96e35-967d-4e6d-910c-b91064d14120	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 14:16:15.755712+00	
00000000-0000-0000-0000-000000000000	597c2958-8769-4680-84d8-3bf2d3d11d17	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 14:44:48.089977+00	
00000000-0000-0000-0000-000000000000	b0ce0c98-d089-4a6a-ac52-f6bd2970aaf7	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 14:46:59.616195+00	
00000000-0000-0000-0000-000000000000	6dd732ae-32a7-4b5b-b4a6-ad5630b7f2b6	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-10 14:49:53.233635+00	
00000000-0000-0000-0000-000000000000	151be7bf-9c3f-4e56-9266-817819ff920b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 14:49:59.111485+00	
00000000-0000-0000-0000-000000000000	f00b0b92-a9ba-4289-9b2b-d55545391bf2	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 14:58:29.288824+00	
00000000-0000-0000-0000-000000000000	372ed5d2-2112-4332-b6d4-3aebebe4d9a8	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 15:17:30.366464+00	
00000000-0000-0000-0000-000000000000	587a66c6-057d-42e2-b802-e1eaf54788a5	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 15:20:11.008324+00	
00000000-0000-0000-0000-000000000000	b03505c4-77bb-446e-a4dd-1166d82c959b	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 15:26:54.446145+00	
00000000-0000-0000-0000-000000000000	e7844186-12cc-4804-b1d1-5768678a0507	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 17:05:10.951592+00	
00000000-0000-0000-0000-000000000000	f6ed36d9-3ee1-474d-a009-a65d722f4439	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-10 17:05:10.965019+00	
00000000-0000-0000-0000-000000000000	d4817365-542e-45d3-a075-34c8eea13c73	{"action":"login","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-10 17:35:18.988092+00	
00000000-0000-0000-0000-000000000000	1094b141-c76d-4874-b2cc-a745e8025ea2	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 04:36:01.442407+00	
00000000-0000-0000-0000-000000000000	ea707784-f9fd-424c-b71d-dda22d136c4e	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-11 04:36:01.465414+00	
00000000-0000-0000-0000-000000000000	aa5386d0-b393-4edd-98cc-9521fbabc6b4	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 05:11:52.44418+00	
00000000-0000-0000-0000-000000000000	c92549f3-a0cc-4d31-a3a3-e24cdddd7b3a	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 05:11:52.456867+00	
00000000-0000-0000-0000-000000000000	30f850a3-c365-40e2-babf-f014a9dd473e	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 06:15:03.304539+00	
00000000-0000-0000-0000-000000000000	11a85d3b-c496-4823-af0f-beccb21ae7f7	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 06:15:03.313907+00	
00000000-0000-0000-0000-000000000000	dae49f2b-933d-4b98-9e2d-2b4e88880a1b	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 07:18:08.214044+00	
00000000-0000-0000-0000-000000000000	141f181f-5ade-49b5-b1f0-21c65f3e0bd4	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 07:18:08.223436+00	
00000000-0000-0000-0000-000000000000	8138c3da-50d3-48a6-9274-8e05cbc2b8aa	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 08:17:41.090356+00	
00000000-0000-0000-0000-000000000000	33e261ab-6440-4e2b-bf75-1f2d85118986	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 08:17:41.098578+00	
00000000-0000-0000-0000-000000000000	3609a6db-3fc4-4483-aff1-7fb892faa9f5	{"action":"token_refreshed","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 09:16:15.328888+00	
00000000-0000-0000-0000-000000000000	0240ffbe-2838-4f75-b8db-b26407f86da4	{"action":"token_revoked","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"token"}	2025-08-13 09:16:15.339635+00	
00000000-0000-0000-0000-000000000000	8755f9d4-bfe1-4200-b87c-8a9e90bbb79b	{"action":"logout","actor_id":"08d354a7-37c5-46bf-96d3-46f63981ff06","actor_username":"admin@kdadks.com","actor_via_sso":false,"log_type":"account"}	2025-08-13 09:27:53.504203+00	
00000000-0000-0000-0000-000000000000	2c2f8af3-f503-4dc4-8c3d-7b991efc5c2a	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"amit@nirchal.com","user_id":"02371832-093b-4405-aa2a-4852269e535a","user_phone":""}}	2025-08-18 15:58:30.917554+00	
00000000-0000-0000-0000-000000000000	18e7edb1-8cf6-4675-8200-2d9bf6f528a5	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-18 16:15:30.889915+00	
00000000-0000-0000-0000-000000000000	028bd558-9bfc-4cc6-b782-6ccdcced67e9	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-18 16:17:41.216838+00	
00000000-0000-0000-0000-000000000000	5ce6b875-c262-46b1-8264-bc6acb54f0ad	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 04:41:33.82077+00	
00000000-0000-0000-0000-000000000000	561a09d7-3051-49f8-9c97-dcfc54008f78	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 04:58:00.400703+00	
00000000-0000-0000-0000-000000000000	34d91cfe-a22a-46c3-9316-0ae577e0559f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 04:58:17.956207+00	
00000000-0000-0000-0000-000000000000	89f702ea-3d11-40eb-9e05-d3e0a37579c8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 05:00:35.187216+00	
00000000-0000-0000-0000-000000000000	85b92718-fcc9-4453-8398-fc0295a74907	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 06:08:50.813291+00	
00000000-0000-0000-0000-000000000000	09cbaf0e-7492-4a08-ad50-00008b8b48dc	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 06:08:50.826947+00	
00000000-0000-0000-0000-000000000000	ce10c36b-442b-492d-911e-f65d2bad05e4	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 06:09:18.076139+00	
00000000-0000-0000-0000-000000000000	78cad4db-462e-4ab6-85c2-ade8222e012c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 06:17:15.206672+00	
00000000-0000-0000-0000-000000000000	b08cf2ba-b58d-491d-9b82-eefe84f454c4	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 08:03:22.140818+00	
00000000-0000-0000-0000-000000000000	303eb09d-75f4-4628-854e-19a850b345e9	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 08:03:22.154922+00	
00000000-0000-0000-0000-000000000000	84b306b7-1ffb-4e88-a312-c659df840670	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-19 08:03:32.560966+00	
00000000-0000-0000-0000-000000000000	f18f2dde-aab5-4ab6-a608-a49d32d97015	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 09:02:01.266944+00	
00000000-0000-0000-0000-000000000000	c3683a0e-a219-45f1-b4da-3fa343fbf43a	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-19 09:02:01.291037+00	
00000000-0000-0000-0000-000000000000	4dcf7cac-a708-44ef-ace1-b7c07f3b1e77	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 12:40:53.936898+00	
00000000-0000-0000-0000-000000000000	fc119bb3-944e-4096-a35f-efd0dc7b9211	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 12:40:53.967088+00	
00000000-0000-0000-0000-000000000000	eebcccd2-92c5-4f9c-bd3e-787af21e5b92	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 12:41:13.868307+00	
00000000-0000-0000-0000-000000000000	00dbbfb2-8938-4e0f-99da-96472658d282	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 12:44:15.31158+00	
00000000-0000-0000-0000-000000000000	dc75d3ca-d57c-4f47-a05a-5a092572326a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 12:51:18.236752+00	
00000000-0000-0000-0000-000000000000	184f87e5-9a80-4b9d-b2dc-e3661a395552	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 12:59:23.856973+00	
00000000-0000-0000-0000-000000000000	7636cd28-16d5-4732-b434-e17e42a13c07	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:05:48.990878+00	
00000000-0000-0000-0000-000000000000	171c995c-4bd8-46e3-8bdc-12c25e90b26a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:10:26.052259+00	
00000000-0000-0000-0000-000000000000	201221ef-f5d5-4f75-b24d-2706ee9b0400	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:11:07.075036+00	
00000000-0000-0000-0000-000000000000	e902a6b7-f163-4d4e-b0b3-8dc4c5f5ca45	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:19:36.756211+00	
00000000-0000-0000-0000-000000000000	2dac6533-5269-4bf9-8f6c-604033b43d2a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:24:58.826799+00	
00000000-0000-0000-0000-000000000000	10ccf49b-0a3d-4ed7-a20e-69ebaa71cd49	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:30:31.82767+00	
00000000-0000-0000-0000-000000000000	c1624b62-980b-4e9e-99c1-d91d9cfadb97	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:40:14.164111+00	
00000000-0000-0000-0000-000000000000	61e9a632-8801-475e-a132-e5eccb9c7b8c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 13:40:56.552402+00	
00000000-0000-0000-0000-000000000000	a4918bdd-bd4e-45a3-97cd-916093ea1c97	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 14:44:49.827786+00	
00000000-0000-0000-0000-000000000000	851bf5ce-0e0e-49bb-a3c7-fbad7fc7ab16	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 14:44:49.842549+00	
00000000-0000-0000-0000-000000000000	a20dcc35-cdea-4a4c-9e75-0fda422c7a43	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:45:16.085115+00	
00000000-0000-0000-0000-000000000000	2ed330d8-fe00-4be8-8c20-a361803ce58e	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:49:47.436574+00	
00000000-0000-0000-0000-000000000000	b8ad3e6d-0151-49ca-b138-cf2235de514c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:53:55.756835+00	
00000000-0000-0000-0000-000000000000	1f625dd1-0287-4d08-93a2-294165daa46b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:57:59.412925+00	
00000000-0000-0000-0000-000000000000	655fbd6e-3e7a-4834-a2c8-f8c1d2621a32	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:59:23.370531+00	
00000000-0000-0000-0000-000000000000	45010127-923c-4419-bc7b-61ad3838ec1a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 14:59:46.814491+00	
00000000-0000-0000-0000-000000000000	93f1ba01-e789-4cef-81d5-8f091e6eb4ab	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 15:03:23.605064+00	
00000000-0000-0000-0000-000000000000	c729afe4-e7d3-43d8-aa02-8a006f3dcce4	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 15:08:35.841316+00	
00000000-0000-0000-0000-000000000000	57cb5875-4a97-41af-b2a1-ab464c465cc6	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 15:18:03.858498+00	
00000000-0000-0000-0000-000000000000	271488b5-23ab-4974-b195-460e7d7da806	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 15:24:20.199783+00	
00000000-0000-0000-0000-000000000000	39013050-2b99-476d-b0d1-031d8e8191a4	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-20 15:26:40.731105+00	
00000000-0000-0000-0000-000000000000	c1998cbc-e64a-45b4-82b1-a7130672903a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-20 15:26:48.782+00	
00000000-0000-0000-0000-000000000000	eddecca7-adfa-40f6-a4dd-598dc4332a61	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 17:33:34.497543+00	
00000000-0000-0000-0000-000000000000	482da820-d780-49e1-93af-7514e97a8f5e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-20 17:33:34.520473+00	
00000000-0000-0000-0000-000000000000	9f2615a0-5567-4ae7-a890-e08320b5b27e	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 03:35:27.4502+00	
00000000-0000-0000-0000-000000000000	8e9baf84-2b82-454d-a1d7-71bac1fc46c1	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 03:58:50.449504+00	
00000000-0000-0000-0000-000000000000	63117808-6cd9-4eae-84e2-2f368834b818	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 03:58:50.460841+00	
00000000-0000-0000-0000-000000000000	705450ef-74b2-4d43-a2a8-cc434057e09f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 03:58:57.45096+00	
00000000-0000-0000-0000-000000000000	dc1dd60b-ada8-4466-abf7-fa0461c0cdaf	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:04:58.793017+00	
00000000-0000-0000-0000-000000000000	49784d2b-739c-4642-b6e2-78f5bc93356f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:08:14.541521+00	
00000000-0000-0000-0000-000000000000	119ea2b2-108b-4056-b007-641f324eb0d0	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:12:00.303881+00	
00000000-0000-0000-0000-000000000000	9ef84091-d451-4833-9c03-bc88d09943bf	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:15:14.914838+00	
00000000-0000-0000-0000-000000000000	0886e19c-ba6f-4b67-a429-cd0589f3a9c8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:15:42.548914+00	
00000000-0000-0000-0000-000000000000	9e5871b3-1b34-433f-9362-8b82d0eac085	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:19:15.654612+00	
00000000-0000-0000-0000-000000000000	7feabd07-dc88-4353-9b94-cb16bc36b2c7	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:22:21.771302+00	
00000000-0000-0000-0000-000000000000	574d7a08-f397-4fc7-8dc4-093f3856b5fb	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:26:26.342607+00	
00000000-0000-0000-0000-000000000000	19c989ab-5cbb-47c6-91b0-cfc2d83b1265	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:29:16.287768+00	
00000000-0000-0000-0000-000000000000	8e82c2ba-816a-4c65-a740-d9d88c33e9d0	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:31:38.54603+00	
00000000-0000-0000-0000-000000000000	8c202cd2-b7b0-4617-8c6c-c69ba27d281b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:35:01.208346+00	
00000000-0000-0000-0000-000000000000	48443db3-5cc8-40b1-b143-c859b7cf49ba	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 04:38:10.123609+00	
00000000-0000-0000-0000-000000000000	03a67f6a-d2dd-4370-a3e5-f0500575bddb	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 05:36:38.254318+00	
00000000-0000-0000-0000-000000000000	e3e19842-48b4-4577-83cf-e5fac74eb76f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 05:36:38.277218+00	
00000000-0000-0000-0000-000000000000	1a3e4547-ad3c-43e1-8b70-0ecaf370ccb9	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 05:53:18.976969+00	
00000000-0000-0000-0000-000000000000	a8eb24db-fb73-479c-a45a-32eea87be93b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 06:22:54.675763+00	
00000000-0000-0000-0000-000000000000	be0e19a0-fbb0-4da9-a447-c6fd3bc7159a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 06:25:48.185514+00	
00000000-0000-0000-0000-000000000000	d69da597-dddf-46c6-9dc9-f4d04fc82f49	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 06:31:36.653496+00	
00000000-0000-0000-0000-000000000000	d66725b7-0853-41fc-88d4-c5396d4022ed	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 07:34:32.912337+00	
00000000-0000-0000-0000-000000000000	8c6b5ed3-2914-4dea-8c11-f001d3cf00f7	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 07:34:32.938148+00	
00000000-0000-0000-0000-000000000000	303c1831-4c69-49e7-a3da-024157b3487d	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 08:15:24.787988+00	
00000000-0000-0000-0000-000000000000	f9a0560d-a40a-4cbb-b820-8f9fff725d27	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 08:55:24.868121+00	
00000000-0000-0000-0000-000000000000	55465f60-a5a3-472e-8523-38f26da15104	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 09:03:25.880818+00	
00000000-0000-0000-0000-000000000000	68c2f3b3-e79d-489f-a6b6-c22f9b906c4f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 09:13:21.847569+00	
00000000-0000-0000-0000-000000000000	db94b70f-3bca-4dbf-8658-d128a19c5652	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 09:17:00.827991+00	
00000000-0000-0000-0000-000000000000	5f815d71-b27c-4b17-99c6-dcf862c0f5ba	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 09:23:35.744188+00	
00000000-0000-0000-0000-000000000000	68fcabb7-81c7-4fa5-a404-29e75e275cee	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 09:41:20.839945+00	
00000000-0000-0000-0000-000000000000	fc67a027-8c8c-4934-b036-a663a0d2eaa7	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 10:40:04.557867+00	
00000000-0000-0000-0000-000000000000	a66a3ba3-52ab-4966-9a60-900d9b6a0f8c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 10:40:04.576912+00	
00000000-0000-0000-0000-000000000000	b89ddca9-a4dd-4dda-9199-a1fc8b7f4fc3	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 10:44:59.742739+00	
00000000-0000-0000-0000-000000000000	65421bab-a046-452c-8f81-127090986539	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 10:57:04.523422+00	
00000000-0000-0000-0000-000000000000	0e9f87b9-a024-409f-90cd-0d9327df1c37	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 11:02:25.133598+00	
00000000-0000-0000-0000-000000000000	c60e4720-5ddc-4a0c-8a11-6bbe98e5d0d8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 11:06:23.620128+00	
00000000-0000-0000-0000-000000000000	f6de4c99-8b21-462d-9188-b23e9f2d155c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 11:06:27.800621+00	
00000000-0000-0000-0000-000000000000	596c8a0e-ed02-41b5-bbed-1ae0086c8257	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 11:22:16.929387+00	
00000000-0000-0000-0000-000000000000	c66e0a68-816c-4a5e-a2bc-d43a622ca5bd	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 11:26:50.201846+00	
00000000-0000-0000-0000-000000000000	b5977e3e-5e57-4240-a84d-496247890b2f	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 12:25:15.538164+00	
00000000-0000-0000-0000-000000000000	969d195f-d06e-46f6-bf81-266cdc77a390	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 12:25:15.559839+00	
00000000-0000-0000-0000-000000000000	594ae720-02d6-428c-878d-d6e2b49d11e7	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 13:23:39.803337+00	
00000000-0000-0000-0000-000000000000	055fb725-54cd-4e8b-8864-54358632cfc8	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 13:23:39.817177+00	
00000000-0000-0000-0000-000000000000	c92cff9f-ebec-47eb-b9fb-f5eb5927ae26	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 13:40:00.549653+00	
00000000-0000-0000-0000-000000000000	715fabb0-998c-40b4-9772-f2a70f40246a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 13:47:31.975298+00	
00000000-0000-0000-0000-000000000000	36c14174-bfa9-4a73-aa10-77985625bf7e	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 14:16:12.44966+00	
00000000-0000-0000-0000-000000000000	569f8dcb-2e77-4a60-a63b-b9ade979b85c	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-21 14:19:53.208167+00	
00000000-0000-0000-0000-000000000000	3b9397dd-0abe-498e-a808-1cdf819c3abc	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 14:19:59.00259+00	
00000000-0000-0000-0000-000000000000	3349d41e-be9c-4805-a034-10ba561e2b36	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 14:24:53.324801+00	
00000000-0000-0000-0000-000000000000	93310f33-7193-4037-8d9f-347b7bd57c66	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 14:32:00.011067+00	
00000000-0000-0000-0000-000000000000	5f4bd811-8c65-4fdc-83ab-580cf91d2493	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-21 14:50:25.523326+00	
00000000-0000-0000-0000-000000000000	d6d6fd94-3701-4dba-a21e-aa8c76ab8dda	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 15:49:07.125369+00	
00000000-0000-0000-0000-000000000000	82e7dee1-038c-41d5-9543-a68671e6bc84	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-21 15:49:07.141908+00	
00000000-0000-0000-0000-000000000000	18d241e8-f36a-479a-b710-f7ecf721673d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 04:04:07.219626+00	
00000000-0000-0000-0000-000000000000	bed6f887-0f8e-43cf-b50a-8f655f0a3e41	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 04:04:07.232274+00	
00000000-0000-0000-0000-000000000000	ad76234a-f877-4be4-b86c-dbab48cec48b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 04:48:22.813023+00	
00000000-0000-0000-0000-000000000000	1c97acef-41f3-43d9-87dc-52ef06e54a97	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 04:52:52.406608+00	
00000000-0000-0000-0000-000000000000	a57f6c1f-23d6-4727-bbfb-6a48dc72fff6	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 04:57:09.330381+00	
00000000-0000-0000-0000-000000000000	c1f622eb-ec1c-4877-bf9e-415e448693d7	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:01:05.641511+00	
00000000-0000-0000-0000-000000000000	1669734c-561a-456a-a136-bca2c5f65dbb	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:44:17.196353+00	
00000000-0000-0000-0000-000000000000	e6fe2f8f-2171-4ba1-8c72-8ed101e8b7ab	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:46:22.311758+00	
00000000-0000-0000-0000-000000000000	bdd30245-f974-4fe8-a900-f6e09d8d11d2	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:48:19.201674+00	
00000000-0000-0000-0000-000000000000	e3fce556-3ac0-45e3-a031-dc15ac22b9d5	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:50:29.486254+00	
00000000-0000-0000-0000-000000000000	e6677722-3187-4b87-96e7-7b9d07e2f5f8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:54:01.307275+00	
00000000-0000-0000-0000-000000000000	694ade29-762c-4241-8f87-16dc51287155	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 05:55:50.694632+00	
00000000-0000-0000-0000-000000000000	e4661976-f231-4373-8f4f-1f183f14ff46	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 06:17:04.503068+00	
00000000-0000-0000-0000-000000000000	29dec535-f9f3-4f7c-948d-0f06d1ec7fd8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 07:15:11.279816+00	
00000000-0000-0000-0000-000000000000	caf9e74b-f435-4e37-8640-a6afbbe1955f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 07:15:11.29884+00	
00000000-0000-0000-0000-000000000000	de4bd125-9383-4e60-b2a0-4f2edc9d98f4	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 07:30:27.772909+00	
00000000-0000-0000-0000-000000000000	2faa33aa-87b7-4fbf-bc26-bd6b1c7afa15	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 08:11:29.14782+00	
00000000-0000-0000-0000-000000000000	5219b343-db8d-4b98-8c84-d6aa4d059854	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 08:23:38.019959+00	
00000000-0000-0000-0000-000000000000	fffea92e-69a2-42da-97fc-2ad886c647e3	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 09:04:14.817489+00	
00000000-0000-0000-0000-000000000000	d9f12db8-9d57-42d0-9c91-448bc8697ce2	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 09:07:34.506493+00	
00000000-0000-0000-0000-000000000000	d7101bf5-08ac-4e37-85bd-7aa5bfc63d64	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 09:41:44.031966+00	
00000000-0000-0000-0000-000000000000	fa236b53-f893-4f7a-a0be-3a178dce24d9	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 09:43:39.884794+00	
00000000-0000-0000-0000-000000000000	f0a404ef-5ee2-43ac-96f9-51ec65f11a99	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 10:14:19.624143+00	
00000000-0000-0000-0000-000000000000	f2f0cc8d-b654-4061-9f7e-fc09e246aa24	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 10:36:46.755714+00	
00000000-0000-0000-0000-000000000000	b493f845-4348-424a-8c7b-c6e57044cc55	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-22 10:38:08.828293+00	
00000000-0000-0000-0000-000000000000	ec547be0-9aa9-4836-8765-c5c31b0dba59	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 10:43:20.421442+00	
00000000-0000-0000-0000-000000000000	ae1fa4c1-50a7-409c-a155-1f28e60e8252	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 10:54:53.320965+00	
00000000-0000-0000-0000-000000000000	55c401c9-060e-4d70-9e9a-f006a1d983f3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 12:40:15.165677+00	
00000000-0000-0000-0000-000000000000	bcf8382a-eb8d-4dd6-a419-6c03a2fae9db	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 12:40:15.192031+00	
00000000-0000-0000-0000-000000000000	3b4ca20f-7350-4b8f-bf85-8d3bb8ef84f3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 13:52:55.530032+00	
00000000-0000-0000-0000-000000000000	805f62c1-40c5-4f8d-9789-c9232ff4658c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 13:52:55.544747+00	
00000000-0000-0000-0000-000000000000	b4594821-34a0-4a66-acf6-0f7fad7c1684	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 14:07:18.126396+00	
00000000-0000-0000-0000-000000000000	58c4b581-1708-4469-bce7-bcafaa48e28f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 14:16:39.216047+00	
00000000-0000-0000-0000-000000000000	a5083dba-57a9-4a2d-ba6c-cd44bb61626f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 14:25:47.592036+00	
00000000-0000-0000-0000-000000000000	8b0f4e90-7d97-4d0a-9a57-c0984b958de8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 14:33:11.940031+00	
00000000-0000-0000-0000-000000000000	b68c5a01-f7ac-4ad6-ab8f-547142eafeac	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 15:39:26.591685+00	
00000000-0000-0000-0000-000000000000	45638882-6787-4379-8e32-59f40cdbd2a5	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-22 15:39:26.606774+00	
00000000-0000-0000-0000-000000000000	9ec7ff70-c026-4701-9f61-624eab78d6bf	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-22 16:10:11.724494+00	
00000000-0000-0000-0000-000000000000	2d811579-bd1a-446b-beb4-cd12064f8e7d	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-22 16:10:54.42964+00	
00000000-0000-0000-0000-000000000000	95e0abd4-3a40-444a-81f7-c6eceace7195	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-22 16:10:59.408478+00	
00000000-0000-0000-0000-000000000000	501b6761-f46e-43c2-93fb-b4e48c797a96	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-23 05:43:01.738286+00	
00000000-0000-0000-0000-000000000000	25f7be8b-f400-4f34-bdc4-6bca692f2346	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-23 05:46:24.453624+00	
00000000-0000-0000-0000-000000000000	39bf8b70-5cfe-4301-99d9-0a0c4f1e1028	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 04:52:25.655472+00	
00000000-0000-0000-0000-000000000000	2157f49c-138a-4eca-8157-c502357eef87	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 05:09:56.358008+00	
00000000-0000-0000-0000-000000000000	61a5505f-59e8-44eb-95b7-9f5baadf11dd	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 05:11:46.694267+00	
00000000-0000-0000-0000-000000000000	f5ac746c-7e70-4785-aa0c-316026c193db	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 05:25:47.725602+00	
00000000-0000-0000-0000-000000000000	2bfc1091-436e-407f-8765-ab088aeb39fe	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 05:37:21.27503+00	
00000000-0000-0000-0000-000000000000	35031dd0-f4ff-4854-9354-25454aa73880	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-25 06:09:37.505673+00	
00000000-0000-0000-0000-000000000000	55e1ce20-7f3d-4316-854e-8b8f6895b825	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 06:47:45.097671+00	
00000000-0000-0000-0000-000000000000	2139870d-6e84-4f3e-b52c-4bff1585b560	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 06:56:45.016374+00	
00000000-0000-0000-0000-000000000000	33c8f711-bf5a-4704-9c05-95ec61f38b17	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 07:47:24.70487+00	
00000000-0000-0000-0000-000000000000	2fcabb00-f9ac-4c21-9c9d-2d9fe39870d2	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 07:47:24.718121+00	
00000000-0000-0000-0000-000000000000	10ada9c7-c376-4f80-a83b-00a440972322	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 07:57:05.646033+00	
00000000-0000-0000-0000-000000000000	711f1665-d5d0-448e-8884-0748605b811e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 07:57:05.65567+00	
00000000-0000-0000-0000-000000000000	c90cd9c7-4df8-4eca-8c31-8e3acde97e9a	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 08:58:51.825031+00	
00000000-0000-0000-0000-000000000000	303c1ac6-8327-4018-af91-919b6cb8afd7	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 08:58:51.844467+00	
00000000-0000-0000-0000-000000000000	c0e1863a-afb6-4c6e-b5f1-83043cb4b0a9	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 09:07:40.44348+00	
00000000-0000-0000-0000-000000000000	af8bf57e-803a-4fb2-aeef-34da1538e000	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 09:07:40.449589+00	
00000000-0000-0000-0000-000000000000	f14d29d8-8d35-4f39-be0a-97f2af334473	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-25 09:12:54.594033+00	
00000000-0000-0000-0000-000000000000	e80da2b4-e13a-46b7-8d9b-fcdf817bdc1b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-25 09:13:13.087208+00	
00000000-0000-0000-0000-000000000000	7e7afe50-b304-48fe-9d4e-c1bf531b5487	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 10:11:17.127891+00	
00000000-0000-0000-0000-000000000000	c41f2c99-78a1-4883-b070-b8158eea84a4	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 10:11:17.141219+00	
00000000-0000-0000-0000-000000000000	d77edd63-c0fd-45a8-80d1-a3a784b6b5e3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 11:09:58.819772+00	
00000000-0000-0000-0000-000000000000	9c94bd05-4c7f-4fa0-b442-6c2c7a197a78	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-08-25 11:09:58.845003+00	
00000000-0000-0000-0000-000000000000	a4533b0d-783e-479b-ba0a-2b55a8945215	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-08-25 11:18:52.047398+00	
00000000-0000-0000-0000-000000000000	d9734f36-6338-40e4-b38b-f260aa624215	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-02 12:59:24.205392+00	
00000000-0000-0000-0000-000000000000	5659efb5-2471-4348-8e60-4ebef88733e6	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-02 13:14:41.293546+00	
00000000-0000-0000-0000-000000000000	6e184c70-19d8-4d29-bb46-ea1df358f99c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-02 14:43:18.877086+00	
00000000-0000-0000-0000-000000000000	3bd559bd-8f4a-4e0c-a6d5-088a79f4ef97	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 15:59:02.987945+00	
00000000-0000-0000-0000-000000000000	d2d3c78f-4fed-422c-a7aa-4d685f889e66	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 15:59:02.999288+00	
00000000-0000-0000-0000-000000000000	64e5515b-4a77-4d24-a0ab-90918fe56837	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 16:57:20.608112+00	
00000000-0000-0000-0000-000000000000	8d589cab-d8a2-4727-b16a-f569b7bf405e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-02 16:57:20.625877+00	
00000000-0000-0000-0000-000000000000	886e4cdc-98dc-4348-a55e-a1f04aba877e	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:23:43.783931+00	
00000000-0000-0000-0000-000000000000	f2a03da2-4ef9-4a6d-a68d-b57ed79d8c20	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 04:23:43.812608+00	
00000000-0000-0000-0000-000000000000	cccd5081-b973-4177-af1d-7da2001cd966	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 07:16:37.598706+00	
00000000-0000-0000-0000-000000000000	211228a5-edcf-4164-b43c-6a55becaaabb	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 07:16:37.61472+00	
00000000-0000-0000-0000-000000000000	71a86e48-8537-48d3-a046-b8005928da09	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 08:15:29.589406+00	
00000000-0000-0000-0000-000000000000	5b4e75be-b8c7-44dd-ab18-ef8e3d88a318	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 08:15:29.610681+00	
00000000-0000-0000-0000-000000000000	b5b68a81-1db5-4447-be4d-5a1fe7fce1ca	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 09:14:20.156731+00	
00000000-0000-0000-0000-000000000000	28f657ee-dd87-48ec-aee8-d1438aa961d0	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 09:14:20.169195+00	
00000000-0000-0000-0000-000000000000	19a21efd-2428-41dd-8bb5-8915b2144243	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 09:54:53.416433+00	
00000000-0000-0000-0000-000000000000	fb1df976-3cc5-4a51-9853-c98ab866ca67	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 09:54:53.432389+00	
00000000-0000-0000-0000-000000000000	0cc76656-b0be-443d-a003-b7072881033e	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 10:12:39.80518+00	
00000000-0000-0000-0000-000000000000	b7b20d5d-97a0-4412-83b1-903a9e9a6c5d	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-03 10:12:39.822503+00	
00000000-0000-0000-0000-000000000000	4c41b7c4-b274-458c-ac00-dee1d12c2433	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-03 10:34:45.966189+00	
00000000-0000-0000-0000-000000000000	8be87ab1-c76d-467e-8260-0c47a1e5687b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 06:30:52.80632+00	
00000000-0000-0000-0000-000000000000	4ceac366-0c85-462c-a18e-75831fdb39d2	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 06:33:25.503121+00	
00000000-0000-0000-0000-000000000000	634060da-224b-4048-8645-10de38432120	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 07:19:18.66895+00	
00000000-0000-0000-0000-000000000000	03fb7799-b4a9-4ab3-8ab1-db90190964ae	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 08:16:35.822298+00	
00000000-0000-0000-0000-000000000000	2b063550-63b1-44f7-adbc-8349e66d798e	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 10:46:54.313184+00	
00000000-0000-0000-0000-000000000000	864d289a-e100-4cb6-92dd-b401c81fa786	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-05 11:23:03.709893+00	
00000000-0000-0000-0000-000000000000	c0d35e40-2184-4f9d-a2d4-8ca40e33354f	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-05 11:49:28.650344+00	
00000000-0000-0000-0000-000000000000	f5da85b6-9f29-44aa-9a63-b71f0bf30d69	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 07:11:22.754326+00	
00000000-0000-0000-0000-000000000000	71053f09-a532-4c3c-a9f3-c20c697d565a	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 07:14:52.328973+00	
00000000-0000-0000-0000-000000000000	a43a72fd-4998-4da5-ba27-28f708389545	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 07:18:18.420643+00	
00000000-0000-0000-0000-000000000000	499fe056-8a8d-4f39-bcf4-610a173aab48	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 08:17:19.38117+00	
00000000-0000-0000-0000-000000000000	9c521c76-ea76-42cf-97cf-21f44f3cc423	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 08:17:19.390675+00	
00000000-0000-0000-0000-000000000000	faf969ab-6d26-4821-83ec-354f94e2de2b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 08:35:09.428769+00	
00000000-0000-0000-0000-000000000000	69a3fd9b-c003-453d-9186-122b28d96d5a	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 09:33:20.772205+00	
00000000-0000-0000-0000-000000000000	0528c6e4-3597-4aa2-b687-bc0ff5ef98d5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 09:50:09.143176+00	
00000000-0000-0000-0000-000000000000	06a5a8aa-a0ce-4e20-a00a-e85552414362	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 09:50:09.148644+00	
00000000-0000-0000-0000-000000000000	ba580fb5-58f5-41fa-b8ff-4fa71047c2b5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 10:59:39.387316+00	
00000000-0000-0000-0000-000000000000	7d59ace6-7271-4aaf-a14d-0c9d9f9cb317	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 10:59:39.40396+00	
00000000-0000-0000-0000-000000000000	3c7bf965-cfc6-4818-a011-8d4ed142229c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 11:36:56.098591+00	
00000000-0000-0000-0000-000000000000	d3707081-3b8f-4b74-9674-eea0a3ef666d	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 11:46:27.103069+00	
00000000-0000-0000-0000-000000000000	878735c3-0a55-4557-97bb-215c040278ec	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 12:08:24.364016+00	
00000000-0000-0000-0000-000000000000	4b1b6aea-1290-45e2-961f-59f240ae5e61	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 12:13:37.966566+00	
00000000-0000-0000-0000-000000000000	e05c4251-58cb-425f-9617-8386fc610032	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 12:15:17.330873+00	
00000000-0000-0000-0000-000000000000	37908290-8aea-40ae-8deb-2fc1241c8b3c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 12:35:47.306285+00	
00000000-0000-0000-0000-000000000000	3915d954-432c-4593-9a73-ba499ed8cac3	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 12:56:36.453128+00	
00000000-0000-0000-0000-000000000000	79671d78-c993-4120-9937-e2098dcbc417	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 13:22:27.071232+00	
00000000-0000-0000-0000-000000000000	6eef8845-5cfb-414e-9604-1ea4c30da7a2	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 14:21:03.881535+00	
00000000-0000-0000-0000-000000000000	e2cbbd77-9f5a-4865-8f02-016dadfb7485	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-06 14:21:03.901193+00	
00000000-0000-0000-0000-000000000000	22fb042e-cf6f-4992-a5a5-c33e011d2244	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 15:12:18.345489+00	
00000000-0000-0000-0000-000000000000	60d9c9ee-3349-4efe-8296-4d7215f54bab	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 15:13:01.589413+00	
00000000-0000-0000-0000-000000000000	9cd441d6-310d-43f7-be3d-0e53725e76bd	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-06 15:35:39.321494+00	
00000000-0000-0000-0000-000000000000	1ae02c48-177e-452a-af91-76b40cf609d0	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-06 16:08:21.430519+00	
00000000-0000-0000-0000-000000000000	51591625-a7b9-49ac-9d7b-4be9cca0b120	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 08:54:56.285542+00	
00000000-0000-0000-0000-000000000000	cd0b69ca-159c-44dc-8336-a761b13313d4	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 09:47:56.159259+00	
00000000-0000-0000-0000-000000000000	46fadd9b-1a0a-4f87-b006-adfcccb43390	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 09:52:25.395716+00	
00000000-0000-0000-0000-000000000000	5a1bf3c7-1dad-466a-b2ab-47b5bee84829	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 10:02:23.107859+00	
00000000-0000-0000-0000-000000000000	47fc8044-0593-4d78-ba2c-b83a9dd72172	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 10:47:54.752469+00	
00000000-0000-0000-0000-000000000000	7aed661c-0676-4cb4-a985-8ce9415dc895	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 11:32:03.426471+00	
00000000-0000-0000-0000-000000000000	6be09cbe-100e-4c2a-a2fb-2f940100b3aa	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 11:32:03.441671+00	
00000000-0000-0000-0000-000000000000	654ef4e1-adac-4ce3-9193-53181740feeb	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 11:48:08.845925+00	
00000000-0000-0000-0000-000000000000	cdb34d16-d448-47b0-b232-74636b6f5669	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 11:48:08.855713+00	
00000000-0000-0000-0000-000000000000	ad0c9917-0124-41f6-bf40-71878ea9832f	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-07 12:27:14.259496+00	
00000000-0000-0000-0000-000000000000	cfa57a00-e8d6-44e3-a3a2-145014daa922	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 12:29:27.341067+00	
00000000-0000-0000-0000-000000000000	a4b53994-7411-4d89-b671-7601c6ec8939	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-07 12:49:48.667065+00	
00000000-0000-0000-0000-000000000000	51338cb8-649d-4b95-abc8-f5bbfa3c0d22	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 13:41:30.427796+00	
00000000-0000-0000-0000-000000000000	cbbb8a38-f25f-4cd8-9792-8e23a17c3a23	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:01:53.02918+00	
00000000-0000-0000-0000-000000000000	b0604d80-4d22-434b-bc0f-fa68f26e1797	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-07 15:01:53.051499+00	
00000000-0000-0000-0000-000000000000	6fbe52bd-079f-4713-9fee-6b29038f04ea	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 15:02:58.394269+00	
00000000-0000-0000-0000-000000000000	aece896a-6a60-43aa-95d6-95318805829d	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-07 15:05:12.463029+00	
00000000-0000-0000-0000-000000000000	f28238c9-3b88-4535-883c-a29be4cd69e9	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 16:13:28.951395+00	
00000000-0000-0000-0000-000000000000	c199a37d-fba4-4f22-b087-400fe1e1add0	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-07 16:54:29.464473+00	
00000000-0000-0000-0000-000000000000	7f552235-4e37-4dc3-9b0d-be6ef156bb18	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-07 16:55:33.386624+00	
00000000-0000-0000-0000-000000000000	8c8fdbf8-d138-42c2-a674-549d305998fe	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-07 16:59:03.599614+00	
00000000-0000-0000-0000-000000000000	9bad5cc2-333b-4428-92c6-37d813c163e4	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 10:57:32.079518+00	
00000000-0000-0000-0000-000000000000	a443f933-3be8-49d8-8299-c5160adfb47b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 11:05:22.417609+00	
00000000-0000-0000-0000-000000000000	3f794cf1-882d-482d-aab8-47763d01e4f0	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:03:40.138919+00	
00000000-0000-0000-0000-000000000000	675a066b-20d0-4ec1-9665-1742dd28bad0	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 12:03:40.155647+00	
00000000-0000-0000-0000-000000000000	8b7e58be-c717-4fc3-9c46-b1a96fb60164	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 12:14:26.408858+00	
00000000-0000-0000-0000-000000000000	74fc0418-4889-4358-bbf4-90a078c2c1f7	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 12:25:51.373787+00	
00000000-0000-0000-0000-000000000000	169d5270-f6cc-40cf-b9c5-dc59065def51	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 13:25:53.017309+00	
00000000-0000-0000-0000-000000000000	35b63f34-350c-4bc6-9002-531bb27da82b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 13:25:53.038425+00	
00000000-0000-0000-0000-000000000000	56f8761a-12ba-4485-b94d-d3154166e76e	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 13:41:18.076045+00	
00000000-0000-0000-0000-000000000000	07baa6b5-9a60-4030-96c8-75811d159885	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 14:24:24.216564+00	
00000000-0000-0000-0000-000000000000	4e811b97-74ba-4b9f-8666-c1a4063d3ea7	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 14:24:24.225706+00	
00000000-0000-0000-0000-000000000000	d787de0f-021b-4584-80cb-5446b127c8e3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 14:50:08.743638+00	
00000000-0000-0000-0000-000000000000	606bb9a4-5386-483e-b92c-5c4f7e10404c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 14:50:08.756583+00	
00000000-0000-0000-0000-000000000000	04cffd92-e101-4447-a3b0-0fdb8c2e7749	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 14:50:34.157004+00	
00000000-0000-0000-0000-000000000000	9a78f8f4-de51-40b1-99e3-30b86c32867b	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 15:50:25.998217+00	
00000000-0000-0000-0000-000000000000	ebba2e7c-322b-47f5-ba17-881001cf4775	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 15:50:26.00565+00	
00000000-0000-0000-0000-000000000000	d71c6a48-a7a5-40fd-ad5b-c4457d9550db	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 15:50:43.508362+00	
00000000-0000-0000-0000-000000000000	833d95ed-2269-4969-89ed-5a79a91e15a9	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-08 16:08:15.346561+00	
00000000-0000-0000-0000-000000000000	46e523ed-5163-4d17-889e-5120bce68709	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-08 16:31:07.312488+00	
00000000-0000-0000-0000-000000000000	b3b4f054-589b-4a41-9529-6c5cd3afdd9d	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 05:59:41.115278+00	
00000000-0000-0000-0000-000000000000	fac0dc83-e36f-4fd2-b088-cfa71c1c4769	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-09 06:12:57.401955+00	
00000000-0000-0000-0000-000000000000	c1c2d97c-a36a-493a-8a3b-764e0e373013	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 06:22:03.6657+00	
00000000-0000-0000-0000-000000000000	026a7149-9f09-4e9f-86af-156ff91f5316	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 07:24:37.20253+00	
00000000-0000-0000-0000-000000000000	55c2b2d4-7fa9-456a-9e6e-2f5ed385c448	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 07:24:37.223317+00	
00000000-0000-0000-0000-000000000000	ecdd3fbf-8230-4710-8bd6-190c292b3520	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 11:16:44.72589+00	
00000000-0000-0000-0000-000000000000	ee0a0852-6aa7-43af-89ea-4a4882aeda84	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 11:16:44.751543+00	
00000000-0000-0000-0000-000000000000	6b2134f2-9134-417f-8cff-af9fcb9cbf1f	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 12:44:29.110515+00	
00000000-0000-0000-0000-000000000000	2caf6cf2-1d83-4d69-acb6-b7eeb04c8f64	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 12:44:29.128757+00	
00000000-0000-0000-0000-000000000000	ccc1c635-3338-49bb-8184-8fff147f40a8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-09 13:00:08.017358+00	
00000000-0000-0000-0000-000000000000	54fad4c2-28b0-45c7-b027-a9b5a51f440a	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 13:43:33.053137+00	
00000000-0000-0000-0000-000000000000	fafbec6a-829c-43c9-ad37-2ca7e2c9af09	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 13:43:33.063432+00	
00000000-0000-0000-0000-000000000000	cecd1670-9f30-4f28-90f6-fc9afc137f74	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 14:47:13.124175+00	
00000000-0000-0000-0000-000000000000	5564726f-5213-43e5-aa62-fb07bfb1e947	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 14:47:13.142734+00	
00000000-0000-0000-0000-000000000000	eb8bd83e-7f1a-4fd0-959a-9555cab1c123	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 15:17:09.132627+00	
00000000-0000-0000-0000-000000000000	1b9bcb91-164f-4bf1-a95a-f9eec7bc1079	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 15:17:09.154198+00	
00000000-0000-0000-0000-000000000000	3bbf0991-33da-4baa-84f4-a7d98bf54067	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 16:43:17.113393+00	
00000000-0000-0000-0000-000000000000	e6978774-cbaf-4d4d-a5c4-68fd58458401	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 16:43:17.139549+00	
00000000-0000-0000-0000-000000000000	7dc61372-abf2-4140-b972-929f683698c8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 17:43:35.169845+00	
00000000-0000-0000-0000-000000000000	4474c5f0-a845-4b59-8c4f-d47875cb4253	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 17:43:35.198719+00	
00000000-0000-0000-0000-000000000000	359bfc39-f35d-4d29-8f61-66de4f36691e	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 03:56:49.439112+00	
00000000-0000-0000-0000-000000000000	27de674b-546a-40c7-a8d2-74fba2378262	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 03:56:49.460422+00	
00000000-0000-0000-0000-000000000000	153e9b82-0805-483b-971f-9a2f6e1f740a	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 04:58:23.034041+00	
00000000-0000-0000-0000-000000000000	42a229c5-294d-49f1-a18a-5e2f10783132	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 04:58:23.046416+00	
00000000-0000-0000-0000-000000000000	534b5af6-0d25-4af9-b2ef-9b61b8c808e6	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 05:38:18.058203+00	
00000000-0000-0000-0000-000000000000	619010ba-4693-404b-95ba-c3cfa077113e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 05:38:18.070269+00	
00000000-0000-0000-0000-000000000000	72828463-5f81-4b12-a67e-6477622655a5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 05:56:48.266894+00	
00000000-0000-0000-0000-000000000000	5a846979-3d68-48ed-a3b8-dd2603f1b0db	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 05:56:48.275641+00	
00000000-0000-0000-0000-000000000000	8a6ad286-e0d1-45c7-93f9-3b7a9923c8b5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 06:40:56.138806+00	
00000000-0000-0000-0000-000000000000	e1b14e9a-21b3-4920-ae3b-d91a31bfbe5f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 06:40:56.158904+00	
00000000-0000-0000-0000-000000000000	b23011ef-4405-4e69-b354-8375fec275ce	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:22:02.089086+00	
00000000-0000-0000-0000-000000000000	fa5f2292-566d-42ce-83c4-9d7e235e8622	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:22:02.100407+00	
00000000-0000-0000-0000-000000000000	45da95c8-e93d-45d7-8982-ec4197ec07b3	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 07:39:15.722138+00	
00000000-0000-0000-0000-000000000000	5e13aafc-1f3b-4c6f-8775-ab7fd1f2559c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 09:00:12.316902+00	
00000000-0000-0000-0000-000000000000	d5502072-cd40-43b4-98ce-28f7123d6661	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:45:14.562735+00	
00000000-0000-0000-0000-000000000000	2e838e22-17be-4fa5-b6c7-1dc648a5bc10	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 11:45:14.59234+00	
00000000-0000-0000-0000-000000000000	7914a187-3f6e-4466-8ecb-d41b2775af21	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 12:45:04.024857+00	
00000000-0000-0000-0000-000000000000	4b48067a-fffe-4db8-8d18-8fce21a71a21	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 12:45:04.037353+00	
00000000-0000-0000-0000-000000000000	ef50be75-7005-4a1e-b273-cc62de831037	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 14:07:07.232167+00	
00000000-0000-0000-0000-000000000000	aa0c5e4f-3c08-4d6d-be1f-b3ce5366f26d	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 14:07:07.258089+00	
00000000-0000-0000-0000-000000000000	018165ef-3919-4dd3-8bea-26c20e1d410c	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 15:43:32.229791+00	
00000000-0000-0000-0000-000000000000	0551b7d2-a162-48fc-8501-215e67ac363c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 15:43:32.255144+00	
00000000-0000-0000-0000-000000000000	9c28a838-9478-4f75-b378-d037eea6bff0	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 15:43:36.901759+00	
00000000-0000-0000-0000-000000000000	a0decbb0-2489-4e01-9c6e-81a6a65d14d3	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-10 15:56:33.318414+00	
00000000-0000-0000-0000-000000000000	4b81f889-41e5-443e-ac15-3a1ad646081c	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:54:50.027171+00	
00000000-0000-0000-0000-000000000000	54095690-435c-458a-acea-7ddd7d92c9c5	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:54:50.046429+00	
00000000-0000-0000-0000-000000000000	d39266af-ecd4-4aef-afa9-07e28ff10a73	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:53:19.873562+00	
00000000-0000-0000-0000-000000000000	fe66aa87-dbd4-4718-ae9f-c1145ababba0	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:53:19.88656+00	
00000000-0000-0000-0000-000000000000	10b3de5e-6150-4e32-9d9d-94ad7f5aa884	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-10 18:03:56.070026+00	
00000000-0000-0000-0000-000000000000	e7fa43b2-331b-4e54-b184-93f395328362	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 04:31:49.870614+00	
00000000-0000-0000-0000-000000000000	45718dcc-c03d-4065-8443-5a06d0a5452d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 05:34:34.092374+00	
00000000-0000-0000-0000-000000000000	c1d664c2-57c4-4f25-adfe-71f502442ea9	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 05:34:34.105361+00	
00000000-0000-0000-0000-000000000000	3038a6d6-c2cd-4618-9fa6-fa3422e526c8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:01:57.755211+00	
00000000-0000-0000-0000-000000000000	837a2ff4-608f-44d4-911e-e5e70a1d5d6b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:01:57.773677+00	
00000000-0000-0000-0000-000000000000	44dd55ba-1f50-4491-b527-bedf09318248	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:01:06.657106+00	
00000000-0000-0000-0000-000000000000	1591b291-2f36-4347-8c7e-9246b30baa6e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:01:06.674896+00	
00000000-0000-0000-0000-000000000000	7dc1ae00-1190-4dbd-afb4-86ea3398a555	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:51:58.255338+00	
00000000-0000-0000-0000-000000000000	0a0b7e19-2b42-40c6-979c-b2e47664e74b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:51:58.285896+00	
00000000-0000-0000-0000-000000000000	f56e7f6e-582b-46a8-b37b-2a59d7ea706f	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:07:15.055073+00	
00000000-0000-0000-0000-000000000000	4a21fed2-443b-4725-a3a4-d89d4b42f9e1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:07:15.080001+00	
00000000-0000-0000-0000-000000000000	6fc09207-e569-47d0-b574-9c99e3fbda68	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:24:58.203077+00	
00000000-0000-0000-0000-000000000000	e0d6fd4c-7a01-47aa-97c3-acf581272a89	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:24:58.228473+00	
00000000-0000-0000-0000-000000000000	cb18e8dd-0708-4d8f-9592-a300147bd67f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 15:20:33.778289+00	
00000000-0000-0000-0000-000000000000	bc43a791-b145-4456-89f2-6bea489a0038	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:23:30.643839+00	
00000000-0000-0000-0000-000000000000	483cb2ff-68bb-4413-9a70-0d03cf3a13d2	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:23:30.647393+00	
00000000-0000-0000-0000-000000000000	e806d072-5972-4b9e-a064-9f613fbb2a1f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-11 15:23:45.721955+00	
00000000-0000-0000-0000-000000000000	864d6296-7630-4a1e-9bae-7d93c2cd1a4d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:22:37.952435+00	
00000000-0000-0000-0000-000000000000	52d6ec93-834f-4f87-a881-4bd0680d5af4	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 16:22:37.965839+00	
00000000-0000-0000-0000-000000000000	5dfbb0ca-4fd1-4ca3-8672-6cb08a79412f	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 04:27:24.755272+00	
00000000-0000-0000-0000-000000000000	9c92a5d7-a0b4-4e63-ba94-2be20a1dfbe4	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 04:27:24.771042+00	
00000000-0000-0000-0000-000000000000	6c2e53b2-5774-456a-8534-293af1286fee	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 05:25:58.106604+00	
00000000-0000-0000-0000-000000000000	ad585b50-8649-43bc-9eae-2ae25e2d3463	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 05:25:58.114892+00	
00000000-0000-0000-0000-000000000000	b8bb0db5-2767-4887-a10b-cb632f91de94	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 06:25:43.185505+00	
00000000-0000-0000-0000-000000000000	dec95685-3fc4-4f66-98ae-4e91b6cb824e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 06:25:43.206245+00	
00000000-0000-0000-0000-000000000000	f18cbdd9-c1e3-411c-8e73-454185f59219	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-12 06:31:53.303143+00	
00000000-0000-0000-0000-000000000000	f998d1e8-ada9-4b8c-85c9-91e9ae782f15	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:26:12.264905+00	
00000000-0000-0000-0000-000000000000	5ef53408-4971-4f96-bb42-9fb532b5cbe1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:26:12.27838+00	
00000000-0000-0000-0000-000000000000	27b19c28-fbaf-4c3d-b99b-f8d6b4e5e2e3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:26:40.949681+00	
00000000-0000-0000-0000-000000000000	8cc8c75e-28f5-4cf4-a74c-695c1a64141f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:26:40.950357+00	
00000000-0000-0000-0000-000000000000	2afa719c-c32e-49f5-a640-13bb5ed215d0	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:50:00.558984+00	
00000000-0000-0000-0000-000000000000	43079cf9-342e-4034-9b72-f7643d1f720e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:50:00.573931+00	
00000000-0000-0000-0000-000000000000	63a92388-a1bd-4aa9-be6c-7920f5d35b5d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:04:30.225877+00	
00000000-0000-0000-0000-000000000000	467ac93a-692d-41ef-b4f0-d1739a26c27f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:04:30.23497+00	
00000000-0000-0000-0000-000000000000	7501b6ac-7ac3-4a0b-9f8c-fae2b99548e0	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:10:27.548156+00	
00000000-0000-0000-0000-000000000000	93f45515-b17c-4213-aa3e-455c91b7307d	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:10:27.550613+00	
00000000-0000-0000-0000-000000000000	58113590-d966-4584-97aa-7b9d11fba02a	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:53:38.145637+00	
00000000-0000-0000-0000-000000000000	ad3ec284-9d84-4b05-88b1-ffabff8c15b2	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:53:38.169806+00	
00000000-0000-0000-0000-000000000000	dd288587-1926-48db-9f2e-09c791a647e5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:53:39.317761+00	
00000000-0000-0000-0000-000000000000	9dffd630-0f79-4ac3-87e5-5879465ade02	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:53:39.325191+00	
00000000-0000-0000-0000-000000000000	caccd147-9fc1-46ba-88ac-a7b06d95bc2d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:29:24.421049+00	
00000000-0000-0000-0000-000000000000	1bd92cb9-b9d0-4af8-aeb8-71f0d5aac662	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:29:24.439466+00	
00000000-0000-0000-0000-000000000000	3f9d0efe-75c4-48b1-aa47-331e15c44644	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:57:42.188892+00	
00000000-0000-0000-0000-000000000000	b87ec4aa-7c0e-4992-89b9-84743d9ec1a6	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 11:57:42.20365+00	
00000000-0000-0000-0000-000000000000	ae3b8293-a229-407f-98c9-5c252754de42	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:07:34.781661+00	
00000000-0000-0000-0000-000000000000	65634437-2f02-4f62-bbd4-26b4b0860579	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:07:34.810656+00	
00000000-0000-0000-0000-000000000000	2ad2156d-2502-405b-8252-39edd695f1fe	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:10:33.445108+00	
00000000-0000-0000-0000-000000000000	6204588b-69d0-4622-88cd-eb5d933eff4e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 14:10:33.447888+00	
00000000-0000-0000-0000-000000000000	891becfb-44b9-46f9-a71a-6b687f2c9652	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:06:08.397726+00	
00000000-0000-0000-0000-000000000000	373d15fd-cdf3-466d-90c9-ac8b71e419a8	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 15:06:08.415105+00	
00000000-0000-0000-0000-000000000000	f20d3e71-600c-4d58-9cb7-55044b4eea94	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 13:52:40.705399+00	
00000000-0000-0000-0000-000000000000	9ec76a05-0de8-4020-bf86-cf322b196a67	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 13:52:40.737711+00	
00000000-0000-0000-0000-000000000000	8c74f9c5-5172-4cab-860d-469da7061cf1	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 14:08:39.219141+00	
00000000-0000-0000-0000-000000000000	da680d1a-44aa-459b-8db2-f634cd578f1c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-14 14:08:39.232358+00	
00000000-0000-0000-0000-000000000000	dfa401ed-8766-475b-be3b-937715035e2a	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-14 14:13:41.727263+00	
00000000-0000-0000-0000-000000000000	8ef56093-6778-4304-bdc1-3c016484b1f3	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-15 11:37:31.293199+00	
00000000-0000-0000-0000-000000000000	d8fb447b-a37f-4bf5-b263-e5b2452f6500	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-15 12:24:47.13845+00	
00000000-0000-0000-0000-000000000000	c22f78ca-68a3-4dbd-a2d4-be560a730c74	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 12:37:10.84585+00	
00000000-0000-0000-0000-000000000000	a126c9cd-0306-4080-9482-6440dc24ba09	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 12:37:10.856916+00	
00000000-0000-0000-0000-000000000000	358116c3-ad51-4f4d-9c6a-e0be89a4ffa8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 13:52:39.920227+00	
00000000-0000-0000-0000-000000000000	1cb565b0-c851-4f92-96e8-4f710c6433fc	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 13:52:39.948092+00	
00000000-0000-0000-0000-000000000000	a2d19fb7-c315-4aec-84e4-14531000a7b3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 14:57:16.49828+00	
00000000-0000-0000-0000-000000000000	3d86461a-5798-47e3-a89b-70f810018b16	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-15 14:57:16.519105+00	
00000000-0000-0000-0000-000000000000	4cb12692-fde2-413d-a89f-0a84f0775513	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 03:55:41.512882+00	
00000000-0000-0000-0000-000000000000	8ea64a39-950e-47fa-ad42-acd8c7eea5dd	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 03:55:41.53914+00	
00000000-0000-0000-0000-000000000000	19f0cdac-f111-4b80-99a5-08fb07e7f752	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 15:52:28.038577+00	
00000000-0000-0000-0000-000000000000	a06c5e96-402f-4669-86e9-9663e98fe507	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-17 15:52:28.069601+00	
00000000-0000-0000-0000-000000000000	70797650-4cf0-41ac-af54-1ae7c2c29568	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-18 03:34:41.19431+00	
00000000-0000-0000-0000-000000000000	fec0108b-a77a-437d-a2a3-6076063a25c1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-18 03:34:41.217888+00	
00000000-0000-0000-0000-000000000000	01a84f57-da32-4243-b5f9-ac08350aae0f	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 05:29:41.562301+00	
00000000-0000-0000-0000-000000000000	87192516-2f46-4591-bf6a-7b4bb049a22a	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 05:29:41.591327+00	
00000000-0000-0000-0000-000000000000	d3c77019-abbb-4f0b-8a17-fbd243632c3c	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-19 05:42:38.416919+00	
00000000-0000-0000-0000-000000000000	7635cebb-f06a-426e-8765-e90bbe6e67eb	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 06:03:08.500078+00	
00000000-0000-0000-0000-000000000000	853b7e23-4236-4ab8-80a2-b602fbe91b77	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-19 06:03:28.422204+00	
00000000-0000-0000-0000-000000000000	1843d238-a6aa-411f-9bfe-613bf42bfcd0	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 09:10:42.751543+00	
00000000-0000-0000-0000-000000000000	d36cc1fa-3e76-4f04-a7c4-0d0e8d517b94	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 10:44:14.370885+00	
00000000-0000-0000-0000-000000000000	867c2031-aca5-41ad-acd6-ac3d48f69a61	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 10:44:14.395548+00	
00000000-0000-0000-0000-000000000000	16bc5117-d2d3-4a5f-b006-d736d8b6f378	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 11:28:37.560389+00	
00000000-0000-0000-0000-000000000000	96a2ae38-fde7-461e-a182-2e857148bdba	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-19 11:33:25.275908+00	
00000000-0000-0000-0000-000000000000	eee68425-8c78-46ec-9d23-e8cb95be1cab	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 12:22:14.339122+00	
00000000-0000-0000-0000-000000000000	363949ca-a41a-40f9-a34c-f3221f65b0a9	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 14:59:37.18701+00	
00000000-0000-0000-0000-000000000000	f8f4f49b-58b9-43b1-92e4-ac7eaa523c04	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 14:59:37.206979+00	
00000000-0000-0000-0000-000000000000	eda6ef52-dbe1-453e-a7f0-b7c55dca8ece	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-19 14:59:56.373815+00	
00000000-0000-0000-0000-000000000000	24d097e0-8b1f-4f1d-9063-46a5f23a737c	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 07:57:27.186199+00	
00000000-0000-0000-0000-000000000000	9cb2240e-5d92-469e-a2ac-a02b44265908	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 07:57:27.205524+00	
00000000-0000-0000-0000-000000000000	eba93a87-3c44-46f2-91d9-c560cd91c561	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 09:17:44.203678+00	
00000000-0000-0000-0000-000000000000	36ba6ba0-2248-4fa7-8e5d-9563cf13c9af	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 09:17:44.219757+00	
00000000-0000-0000-0000-000000000000	902bcc2c-9491-4451-8025-70e7b122df03	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 10:36:32.729793+00	
00000000-0000-0000-0000-000000000000	b9d6c7ff-df1e-46e9-9b76-f5a646eccda1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 10:36:32.752103+00	
00000000-0000-0000-0000-000000000000	3a24f127-94d9-41b2-8eb6-b86acf41f99c	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 11:45:23.456968+00	
00000000-0000-0000-0000-000000000000	3e9e6140-fbca-4f2c-be3c-d4006b067f08	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 11:45:23.474774+00	
00000000-0000-0000-0000-000000000000	393a145a-6f27-4725-aae1-89f29353054a	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 14:53:44.234426+00	
00000000-0000-0000-0000-000000000000	c952c66b-91ad-477a-b88f-5cc67e04f17c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 14:53:44.256807+00	
00000000-0000-0000-0000-000000000000	a103159f-73f2-4b29-bdaf-e754a665edf8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:07:05.11182+00	
00000000-0000-0000-0000-000000000000	06b1fe7f-7435-47e3-af48-f1b8ee849f4b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:07:05.133815+00	
00000000-0000-0000-0000-000000000000	d3a25724-b912-4ca2-8cd4-acdf312daaac	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-21 14:29:46.722364+00	
00000000-0000-0000-0000-000000000000	4db2ea3e-0186-471c-952d-e7a580f90b9b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-21 14:29:46.756156+00	
00000000-0000-0000-0000-000000000000	fb989d15-d2fb-45cf-bb3e-ed0d175e6ccb	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-09-21 14:29:52.367341+00	
00000000-0000-0000-0000-000000000000	6f758fab-5cec-4f84-b65c-e3fb3203af74	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-24 10:27:25.046715+00	
00000000-0000-0000-0000-000000000000	58243ea4-84b4-486f-bfde-26e61a3dcde9	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-24 11:25:59.838118+00	
00000000-0000-0000-0000-000000000000	02d0f268-bacd-4aab-accf-38bb3baa9dbd	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-24 11:25:59.853269+00	
00000000-0000-0000-0000-000000000000	b0112231-8dec-424b-a2a5-e234a142657c	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-24 13:29:34.25231+00	
00000000-0000-0000-0000-000000000000	bb3fd92c-8e35-4c52-92ae-feeca2f922bd	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-24 13:29:34.282007+00	
00000000-0000-0000-0000-000000000000	394d84bd-42f1-445b-b313-a2d77fde13ee	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-24 14:53:46.226154+00	
00000000-0000-0000-0000-000000000000	3e547564-1c8e-4f46-a7ef-a314a555cd32	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-09-24 14:53:46.238451+00	
00000000-0000-0000-0000-000000000000	a63f99d4-ced1-4753-acb3-7512c8fef561	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 06:12:52.614541+00	
00000000-0000-0000-0000-000000000000	ed95d9fb-2831-43be-81cb-ec8d1aed2cc1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 06:12:52.649052+00	
00000000-0000-0000-0000-000000000000	568f0a59-1009-44f7-9d42-7589cde201c6	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-03 06:52:37.699259+00	
00000000-0000-0000-0000-000000000000	bee1301b-c0ff-4047-9e9e-7209cd754dcf	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 07:10:54.426061+00	
00000000-0000-0000-0000-000000000000	dcff7047-4c0b-4982-94e9-3ddfcfcd551b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-03 07:10:54.438249+00	
00000000-0000-0000-0000-000000000000	41607357-8d88-495a-b520-8b222440b13f	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-03 07:17:41.453302+00	
00000000-0000-0000-0000-000000000000	ae5d6559-1052-4222-b4de-2669b8a72115	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-14 12:31:30.065254+00	
00000000-0000-0000-0000-000000000000	ee7a084f-9d88-4148-aa03-63c10aebffc6	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-14 12:37:11.891748+00	
00000000-0000-0000-0000-000000000000	69befeeb-9920-4753-b32f-ba568103a488	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-14 12:40:04.816256+00	
00000000-0000-0000-0000-000000000000	bcb4487a-63c0-474d-b4d1-5195bd5c9c21	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-14 12:46:22.829738+00	
00000000-0000-0000-0000-000000000000	5786b177-5652-4947-a6ec-c1e0b087a305	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-14 13:34:05.972911+00	
00000000-0000-0000-0000-000000000000	50a09a05-a614-47ad-88a4-9b0dc155a174	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-14 13:34:11.398892+00	
00000000-0000-0000-0000-000000000000	572defd8-1bb3-4dae-8869-fc30336dcfae	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-14 13:45:58.346235+00	
00000000-0000-0000-0000-000000000000	1e573cbb-20c4-4237-bf2e-ccd92024f370	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-14 13:46:04.73946+00	
00000000-0000-0000-0000-000000000000	a697e9eb-5084-42ef-847b-67e6cef90ff4	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-14 14:10:49.605244+00	
00000000-0000-0000-0000-000000000000	cb7421bb-1582-4905-b31d-3e942fc362c2	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 10:03:32.383194+00	
00000000-0000-0000-0000-000000000000	c97706d4-c767-40f2-9a59-c5111298582c	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 10:03:48.374768+00	
00000000-0000-0000-0000-000000000000	651c11ce-1c56-40e2-a2c3-28f44e9aadb9	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-15 10:45:13.984436+00	
00000000-0000-0000-0000-000000000000	7b9591e4-c5cf-4bcb-b95a-5e7a995a27e4	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-15 10:47:39.589483+00	
00000000-0000-0000-0000-000000000000	906b7705-2261-42a3-90aa-1d021f27609c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-16 15:37:22.26562+00	
00000000-0000-0000-0000-000000000000	281733c6-6e3e-4086-991f-23cd4be5a499	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-16 16:39:39.284159+00	
00000000-0000-0000-0000-000000000000	b73e623c-9ceb-436a-9cc9-4d0bd3a79a52	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-16 16:39:39.301437+00	
00000000-0000-0000-0000-000000000000	931578a6-8152-4f70-8911-18c9bd1087bd	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 06:48:37.168359+00	
00000000-0000-0000-0000-000000000000	a1d6a36f-71ce-4f14-8af8-9a4ab72d4beb	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 06:48:37.201726+00	
00000000-0000-0000-0000-000000000000	956c9c67-79dc-495d-a796-e4a660a42d69	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 08:21:53.465686+00	
00000000-0000-0000-0000-000000000000	9166a2b0-2130-4bda-a1c4-0a9f5c05fbe1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 08:21:53.483031+00	
00000000-0000-0000-0000-000000000000	bca70e58-3ef7-4b64-805d-420b1edf1a5a	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-17 08:23:42.323915+00	
00000000-0000-0000-0000-000000000000	92953ec6-9e58-4c1a-bf32-c89425389c9f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 08:26:16.095928+00	
00000000-0000-0000-0000-000000000000	bed21786-16b8-49a4-8e03-e80599934ec5	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 08:35:23.363809+00	
00000000-0000-0000-0000-000000000000	060cd1c5-094a-4522-84d7-214011b6cc99	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 09:24:22.411091+00	
00000000-0000-0000-0000-000000000000	c7fe1055-97c9-4383-91cb-dc084bcd9f4d	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 09:24:22.429763+00	
00000000-0000-0000-0000-000000000000	2582226b-24f5-47b3-b5cf-2cb8a2a2e642	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 10:43:40.250826+00	
00000000-0000-0000-0000-000000000000	9c8a2b60-be2b-4ff3-add8-2c391ed151e6	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 10:43:40.279005+00	
00000000-0000-0000-0000-000000000000	86e83e87-5355-4558-80f5-5a194acf0757	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 11:06:02.790097+00	
00000000-0000-0000-0000-000000000000	01b34523-2d53-4dee-ab94-3be300c203c9	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 11:06:02.810638+00	
00000000-0000-0000-0000-000000000000	b724cb6e-541b-4af2-bcce-cb39da48fd2b	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 11:43:03.154904+00	
00000000-0000-0000-0000-000000000000	5511f5e2-8854-4bb9-8eff-1edc0dfa7dff	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 11:43:03.167667+00	
00000000-0000-0000-0000-000000000000	cc5f4685-2feb-4abe-812b-49f77f6ab8bb	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 12:04:03.134488+00	
00000000-0000-0000-0000-000000000000	e9352122-f579-4759-82b1-429926249e0c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 12:04:03.150437+00	
00000000-0000-0000-0000-000000000000	708a5390-911b-4f29-92ff-001a60c20b3c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 12:25:46.296692+00	
00000000-0000-0000-0000-000000000000	5e57e583-2904-4246-8743-1c89a2a3e531	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 15:56:40.123889+00	
00000000-0000-0000-0000-000000000000	edff4f1f-7a69-479a-bac3-6c09c5f4d5a4	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 15:56:40.155363+00	
00000000-0000-0000-0000-000000000000	f4c5f645-8d20-44c9-af99-139ed4638cfa	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-17 16:47:03.194434+00	
00000000-0000-0000-0000-000000000000	84aa0beb-1782-4acc-85b5-66ce335902c6	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 16:57:29.153524+00	
00000000-0000-0000-0000-000000000000	76cb917e-ae4e-43b2-b634-26135aa06356	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-17 16:57:29.163788+00	
00000000-0000-0000-0000-000000000000	599b31cb-74f4-4889-8303-f4bc0e574c91	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-17 17:06:39.55737+00	
00000000-0000-0000-0000-000000000000	6a6bdd3b-fd3b-4956-85c0-c8bd1a423834	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-18 15:12:33.613222+00	
00000000-0000-0000-0000-000000000000	adc5bcab-eb1a-4f78-a408-54983f867945	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 16:27:57.090548+00	
00000000-0000-0000-0000-000000000000	769db86b-77db-4bcc-9a0c-3bc74f19a8db	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-18 16:27:57.113471+00	
00000000-0000-0000-0000-000000000000	09845b8d-ddc4-43f3-baf2-fc6534070057	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-18 17:15:08.238213+00	
00000000-0000-0000-0000-000000000000	1aead291-91ae-41a3-9956-f2c5fdcb84d8	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-20 05:38:34.203193+00	
00000000-0000-0000-0000-000000000000	ba1c80ce-c35d-4762-b404-90c57a1d3353	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-20 06:36:35.168114+00	
00000000-0000-0000-0000-000000000000	9305c83a-db67-4617-9020-25d0288b2534	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-20 06:36:35.183279+00	
00000000-0000-0000-0000-000000000000	1389349c-0947-4c0d-b1e1-776927b3e8d5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-20 13:45:12.901038+00	
00000000-0000-0000-0000-000000000000	579a7e76-c1c2-49d2-91ab-119fdddc17c9	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-20 13:45:12.930512+00	
00000000-0000-0000-0000-000000000000	db611457-b4be-44d9-9cde-32a1f8acbaae	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-20 13:45:13.518208+00	
00000000-0000-0000-0000-000000000000	b7451f53-098d-435a-9914-eb92a1892164	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-21 07:59:56.228402+00	
00000000-0000-0000-0000-000000000000	b9e242b7-a228-4c5a-8c9e-b29af36f60e6	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 08:59:14.805775+00	
00000000-0000-0000-0000-000000000000	9806b2b6-9c5a-4497-b0ab-7c6b796394af	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 08:59:14.821869+00	
00000000-0000-0000-0000-000000000000	b356e463-5964-4dfd-8c2f-3903abfb98db	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 09:58:25.666079+00	
00000000-0000-0000-0000-000000000000	9219c089-5ec3-4609-8aec-a73de3c6e89e	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 09:58:25.683518+00	
00000000-0000-0000-0000-000000000000	8e41b340-3691-4d7d-8ad4-778bd221b813	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 10:57:25.624995+00	
00000000-0000-0000-0000-000000000000	1d7a4525-bf94-4b52-a3b2-fab69b994225	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 10:57:25.643552+00	
00000000-0000-0000-0000-000000000000	46246763-5b32-4e4f-a514-977bdb68049b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-21 11:27:03.091992+00	
00000000-0000-0000-0000-000000000000	0a0b75d0-3c92-46a3-a20f-b8739ad17db3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 11:56:12.240503+00	
00000000-0000-0000-0000-000000000000	7042fcae-ea99-408e-8829-0fddb6e4798d	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 11:56:12.256107+00	
00000000-0000-0000-0000-000000000000	62d1c833-3a77-4bf6-9188-e6e4a4a5a35a	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 12:26:25.904187+00	
00000000-0000-0000-0000-000000000000	dd89df99-37af-4ee6-a7e4-ff36ee11c842	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 12:26:25.915936+00	
00000000-0000-0000-0000-000000000000	8788588a-fdad-4a55-9e3b-f04c41ef2bb2	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 13:25:25.563306+00	
00000000-0000-0000-0000-000000000000	b43fa91c-3763-45b7-864c-972b1dd8711c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 13:25:25.575963+00	
00000000-0000-0000-0000-000000000000	e564f136-c06e-4bf1-ad91-6c8233f37ec9	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 14:01:36.288109+00	
00000000-0000-0000-0000-000000000000	df1634f4-db3a-4605-8bd2-b6490b052683	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 14:01:36.307668+00	
00000000-0000-0000-0000-000000000000	a32b5a32-b35e-4797-b843-2d58bda2c7a8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 14:24:25.599388+00	
00000000-0000-0000-0000-000000000000	d1b0dd5c-29b9-4c7c-bbf1-8f53f0d38c54	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 14:24:25.609698+00	
00000000-0000-0000-0000-000000000000	964043ec-de60-4345-80e5-4808df154fb5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 15:03:08.502874+00	
00000000-0000-0000-0000-000000000000	635a8a47-58f5-406f-ab34-dc524317ea09	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 15:03:08.514287+00	
00000000-0000-0000-0000-000000000000	8f06fa3e-6481-4f0d-a27b-ec425e959ee8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 15:23:25.702913+00	
00000000-0000-0000-0000-000000000000	123e928d-c359-4bd1-a9a3-729200b5f26b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-21 15:23:25.720711+00	
00000000-0000-0000-0000-000000000000	afc492cc-0e02-4edd-a6ce-f4e3caeef39e	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-21 17:25:12.692388+00	
00000000-0000-0000-0000-000000000000	b425d238-a551-491b-a68d-1f43aff8eb4a	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-21 17:26:26.928469+00	
00000000-0000-0000-0000-000000000000	d3000a8f-4813-4173-8f9d-698f8b0674b4	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 05:18:34.698931+00	
00000000-0000-0000-0000-000000000000	786922db-e1b9-492b-9e37-ad91057caa50	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 05:26:04.483094+00	
00000000-0000-0000-0000-000000000000	213d7741-1fa8-4611-8215-94df24dd35c2	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 05:28:46.139432+00	
00000000-0000-0000-0000-000000000000	ba286627-1caf-4c63-ba8a-439b4715e3ea	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 05:39:23.753332+00	
00000000-0000-0000-0000-000000000000	7fa73098-0df1-4ab8-8606-86679e74eabd	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 05:50:05.20127+00	
00000000-0000-0000-0000-000000000000	c4575e3d-ae51-4948-b2d8-75bda0ed016c	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 06:08:07.818269+00	
00000000-0000-0000-0000-000000000000	07033d52-58b7-4d59-a576-132e4963bc52	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 06:12:00.739031+00	
00000000-0000-0000-0000-000000000000	f69a5548-b29c-4cc0-a38b-8ea247ff4eda	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 07:11:01.649259+00	
00000000-0000-0000-0000-000000000000	f762c88a-8caf-4989-8ae0-c464af9ba138	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 07:11:01.667782+00	
00000000-0000-0000-0000-000000000000	df92d15d-ad10-483a-bcc5-f939ae91e914	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 08:10:01.589695+00	
00000000-0000-0000-0000-000000000000	1d582d61-7833-4847-9539-9f35ea810332	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 08:10:01.60663+00	
00000000-0000-0000-0000-000000000000	bfb8089e-d37d-4c81-b94f-01e01577b5d1	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 09:09:01.618083+00	
00000000-0000-0000-0000-000000000000	bf58cb15-0138-4ac2-9139-84b346c99ee1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 09:09:01.638343+00	
00000000-0000-0000-0000-000000000000	b1652ccc-d77e-4c5e-a0ef-db8fc11fe6c1	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 10:08:01.865231+00	
00000000-0000-0000-0000-000000000000	449c340d-ebdd-4e20-90e4-baab99dd7449	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 10:08:01.879559+00	
00000000-0000-0000-0000-000000000000	e60daee2-a137-4b7f-a0f7-1aeab408095d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 11:07:01.65036+00	
00000000-0000-0000-0000-000000000000	8f085863-6494-4deb-a44e-1a0681d97cd1	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 11:07:01.667959+00	
00000000-0000-0000-0000-000000000000	09615cdb-b9d4-4e3f-a695-591b4fa539fd	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 12:06:01.936064+00	
00000000-0000-0000-0000-000000000000	c869a04f-10d2-4b4f-8f02-498d7ac0f2e8	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 12:06:01.955322+00	
00000000-0000-0000-0000-000000000000	4a3dc0a4-ac8c-4a57-9e8b-49a8407b7e5e	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 13:19:57.05138+00	
00000000-0000-0000-0000-000000000000	ef802462-4716-457e-8de2-e61e54359d02	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 13:19:57.064007+00	
00000000-0000-0000-0000-000000000000	6437e4d2-7e92-49c7-8337-f3cabbff8d83	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 13:20:16.412102+00	
00000000-0000-0000-0000-000000000000	32ef30cd-8fe8-4aef-8db3-5a999c9a4e8f	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 14:18:51.639822+00	
00000000-0000-0000-0000-000000000000	a0fb82a2-f0ca-4c8d-92a1-ebed7e2fe019	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 14:18:51.654002+00	
00000000-0000-0000-0000-000000000000	359b70ba-0398-4668-b480-5656edb116d7	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 14:40:22.400449+00	
00000000-0000-0000-0000-000000000000	600304e5-e15c-407c-8f36-09918c8ada63	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 14:41:57.929458+00	
00000000-0000-0000-0000-000000000000	b1eee6c3-824d-4f1a-b93b-bd65f0f4ff8b	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 14:44:41.917021+00	
00000000-0000-0000-0000-000000000000	302d67ab-a1e1-4e1f-860f-20b9d14026a2	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-22 14:52:48.618153+00	
00000000-0000-0000-0000-000000000000	5599f2ab-cbd2-4ecb-9be1-4af46fddbddb	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 15:52:33.8259+00	
00000000-0000-0000-0000-000000000000	a2383b2c-94fc-4021-991b-eb8d4b780ede	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 15:52:33.855303+00	
00000000-0000-0000-0000-000000000000	16cb244e-1400-4779-874a-26c663db93ec	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 16:50:50.392443+00	
00000000-0000-0000-0000-000000000000	4b5ca33b-5f77-4e43-816e-352050da700b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-22 16:50:50.409199+00	
00000000-0000-0000-0000-000000000000	37734bb5-3ded-474c-91fe-1087d0c6cce9	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-22 16:53:01.633635+00	
00000000-0000-0000-0000-000000000000	40e248f6-ac9b-4abf-9be2-90318cd74ee7	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-23 12:29:49.018711+00	
00000000-0000-0000-0000-000000000000	1c3520ce-3109-438a-80ce-927336156539	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 13:28:34.998357+00	
00000000-0000-0000-0000-000000000000	11260ccf-2632-49c4-9b1c-2b3f8a319f46	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 13:28:35.017452+00	
00000000-0000-0000-0000-000000000000	55b1e935-0bec-4664-82c5-eda7745df10d	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:27:40.480959+00	
00000000-0000-0000-0000-000000000000	fc5e44d7-4f41-4248-988b-cc7a1bc98370	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-23 14:27:40.497073+00	
00000000-0000-0000-0000-000000000000	933f6c0f-678e-4a69-bdcd-a1d6e007aac9	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 04:48:00.123175+00	
00000000-0000-0000-0000-000000000000	29b6d15b-850e-49fe-a557-21102563c3c1	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 07:32:11.578476+00	
00000000-0000-0000-0000-000000000000	bd3d57d8-caba-4e29-8f13-820e48a12897	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-24 07:32:11.613171+00	
00000000-0000-0000-0000-000000000000	baf3dbe7-f894-4dea-81a9-1eb101489c2b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-24 08:05:25.971877+00	
00000000-0000-0000-0000-000000000000	4d06f4a6-4cd4-4e42-a429-b1259eb98b65	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-24 08:06:27.284375+00	
00000000-0000-0000-0000-000000000000	941eee30-e96e-45bf-8a96-596c40995753	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 08:09:53.414638+00	
00000000-0000-0000-0000-000000000000	441c9c75-14a6-4b4c-bfe7-f6a915e03d94	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-25 08:53:52.314042+00	
00000000-0000-0000-0000-000000000000	2ef7876d-11fc-4ffe-8b2d-d5e1c8966ec3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 13:06:27.812921+00	
00000000-0000-0000-0000-000000000000	0b64745d-61d4-490f-8346-75e154589046	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 13:06:27.844016+00	
00000000-0000-0000-0000-000000000000	30550f4a-dbc4-4215-a543-b0a215d38e25	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:22:16.099363+00	
00000000-0000-0000-0000-000000000000	b62a3f0e-fc05-41cc-a656-85fee4998bbb	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 14:22:16.111674+00	
00000000-0000-0000-0000-000000000000	972ab770-2731-445e-ac9f-8bfe00fa235b	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 15:20:44.662687+00	
00000000-0000-0000-0000-000000000000	52ac96b2-a69e-41cc-881e-ae3039bcf71f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 15:20:44.689592+00	
00000000-0000-0000-0000-000000000000	17d7a8a7-c2b2-43d3-8c8e-ec2b44c58d11	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 16:19:14.946223+00	
00000000-0000-0000-0000-000000000000	cdb41bb0-11b3-4413-bd51-d697beff3628	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-25 16:19:14.967212+00	
00000000-0000-0000-0000-000000000000	bfdc3593-28c7-4eea-adc6-e29c642252ac	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 04:54:16.374297+00	
00000000-0000-0000-0000-000000000000	2db70e65-1c85-4aee-a7fd-c6774961bbac	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 04:54:16.388724+00	
00000000-0000-0000-0000-000000000000	96884325-0d1b-4846-bbfc-56ba20060147	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 06:23:33.184196+00	
00000000-0000-0000-0000-000000000000	4260b480-5dc3-4832-846b-b400b44abd23	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 06:31:31.302535+00	
00000000-0000-0000-0000-000000000000	bc83d07a-28cd-40f9-98a6-5a33168d11c0	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 06:31:31.311253+00	
00000000-0000-0000-0000-000000000000	823ee1e4-1f57-4a02-8ae5-f459f4f330d5	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 07:30:12.409878+00	
00000000-0000-0000-0000-000000000000	50616e85-a0d1-46bd-b51e-11d46cc6de21	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 07:30:12.424089+00	
00000000-0000-0000-0000-000000000000	0c53fca0-9617-4106-9a79-4bebca5c3cbe	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 07:51:15.549985+00	
00000000-0000-0000-0000-000000000000	54625e0b-e689-4cc6-a56d-d1677afa7a9a	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 07:51:15.563186+00	
00000000-0000-0000-0000-000000000000	03aa7bc2-532b-4457-b933-c8c5e1904876	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 08:50:44.705895+00	
00000000-0000-0000-0000-000000000000	4f129f07-ea23-4d7b-9b4d-39024c463987	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 08:50:44.730276+00	
00000000-0000-0000-0000-000000000000	cc2feb6c-6d6b-489d-87d2-12878cdb31ad	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 09:49:01.426154+00	
00000000-0000-0000-0000-000000000000	871823b2-b604-49a5-b728-61d24c858aae	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 09:49:01.441452+00	
00000000-0000-0000-0000-000000000000	530cf5b6-2b5a-48a3-afdd-dc77a28c3f37	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 10:47:01.434197+00	
00000000-0000-0000-0000-000000000000	aed9d3aa-1a95-400c-9775-eb8d660d753b	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 10:47:01.453317+00	
00000000-0000-0000-0000-000000000000	1cbbb6fa-dfd0-42b4-af26-7cd4459bad24	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 11:28:53.386839+00	
00000000-0000-0000-0000-000000000000	3ef774ad-cae7-4b8a-bbec-1f6dc32ebe4c	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 11:28:53.400519+00	
00000000-0000-0000-0000-000000000000	02553119-9b61-4a7c-b60d-03922b04bbe8	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 11:45:44.321761+00	
00000000-0000-0000-0000-000000000000	9257dd01-e656-46ed-aff3-0f8738ae8e19	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 11:45:44.337512+00	
00000000-0000-0000-0000-000000000000	f3dc8960-1463-4813-8157-732cd62fac05	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 12:27:28.736564+00	
00000000-0000-0000-0000-000000000000	0597a25f-6c90-40a6-b0aa-545e2e1bc30f	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 12:27:28.759402+00	
00000000-0000-0000-0000-000000000000	7521f150-6f87-450e-8644-fcc0de2fa14d	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-26 12:41:30.497567+00	
00000000-0000-0000-0000-000000000000	f8bb867a-d416-4a3f-86e8-b1f00812bcda	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 12:43:00.390072+00	
00000000-0000-0000-0000-000000000000	217e9ef1-f298-457b-bef8-f7965b6cd7b1	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-26 12:46:30.746304+00	
00000000-0000-0000-0000-000000000000	b7d8a630-6a08-4e43-bca6-27590c611a12	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 14:17:06.24155+00	
00000000-0000-0000-0000-000000000000	065e88e3-e204-47c7-b7f1-665ea2e1b2cb	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-26 15:09:58.060388+00	
00000000-0000-0000-0000-000000000000	4b8b3077-551c-4dfa-855d-ee5fbf0cf3a3	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 15:15:43.222486+00	
00000000-0000-0000-0000-000000000000	9f21066b-bb40-4eb9-99f8-cfcda88f8a70	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-26 15:15:43.236923+00	
00000000-0000-0000-0000-000000000000	f1f9058c-6948-4f9b-b4dc-4328bf586d72	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-26 15:19:17.656877+00	
00000000-0000-0000-0000-000000000000	59c23e9f-5180-43d9-a61a-de864495cc0f	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 06:17:35.9601+00	
00000000-0000-0000-0000-000000000000	c65c7a1a-b4f0-4abf-a3d8-ef8205c6836c	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-28 06:25:33.931214+00	
00000000-0000-0000-0000-000000000000	43a1e6eb-a224-4356-9f68-5bbc1cd73540	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-28 09:58:14.313567+00	
00000000-0000-0000-0000-000000000000	4509d053-65c7-4719-b947-509a6648bfea	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-28 10:00:14.220053+00	
00000000-0000-0000-0000-000000000000	44a948d8-908e-4a54-bc71-7cf5d64748d0	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-30 06:19:59.754388+00	
00000000-0000-0000-0000-000000000000	c7695a9f-39da-40f0-84c0-c4f559c0cb69	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 07:19:04.059583+00	
00000000-0000-0000-0000-000000000000	266cbb1a-1bd4-4192-a6e7-b36997c680bd	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 07:19:04.079669+00	
00000000-0000-0000-0000-000000000000	1cc60315-4ac4-46ef-ba4a-82fcee7999c4	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 08:17:42.085589+00	
00000000-0000-0000-0000-000000000000	9360c979-ea8b-49f7-839f-548b606a97fa	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 08:17:42.100707+00	
00000000-0000-0000-0000-000000000000	a33baaf3-277f-432b-9f61-4e667a465c57	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 08:18:00.094683+00	
00000000-0000-0000-0000-000000000000	88a96496-d92b-4a06-863d-cddc7f2d995b	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-30 08:20:05.052573+00	
00000000-0000-0000-0000-000000000000	9abc340f-9194-4f06-a6c4-4dac8a3097c4	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 09:19:04.395868+00	
00000000-0000-0000-0000-000000000000	fcadd991-aaa0-4f69-8c8f-8724dda3febe	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 09:19:04.416137+00	
00000000-0000-0000-0000-000000000000	38b6cbdd-f26c-42f1-9208-d7c2bab76991	{"action":"token_refreshed","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 10:40:47.762134+00	
00000000-0000-0000-0000-000000000000	aa268d86-1425-4d8a-b49a-482f804f4f66	{"action":"token_revoked","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"token"}	2025-10-30 10:40:47.773148+00	
00000000-0000-0000-0000-000000000000	6a817993-7be2-4cdd-8696-e17f7856afd6	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-30 10:40:50.350739+00	
00000000-0000-0000-0000-000000000000	be81ee03-1e40-456e-bac4-7687364cf6e0	{"action":"login","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-10-30 10:56:29.433802+00	
00000000-0000-0000-0000-000000000000	b7682644-a0de-4e2b-8c17-7c1c3d012d3e	{"action":"logout","actor_id":"02371832-093b-4405-aa2a-4852269e535a","actor_username":"amit@nirchal.com","actor_via_sso":false,"log_type":"account"}	2025-10-30 11:13:35.182872+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
08d354a7-37c5-46bf-96d3-46f63981ff06	08d354a7-37c5-46bf-96d3-46f63981ff06	{"sub": "08d354a7-37c5-46bf-96d3-46f63981ff06", "email": "admin@kdadks.com", "email_verified": false, "phone_verified": false}	email	2025-08-06 08:49:04.022406+00	2025-08-06 08:49:04.022472+00	2025-08-06 08:49:04.022472+00	d6655cde-3adc-459c-a8d8-6069f6b19c52
02371832-093b-4405-aa2a-4852269e535a	02371832-093b-4405-aa2a-4852269e535a	{"sub": "02371832-093b-4405-aa2a-4852269e535a", "email": "amit@nirchal.com", "email_verified": false, "phone_verified": false}	email	2025-08-18 15:58:30.9132+00	2025-08-18 15:58:30.913256+00	2025-08-18 15:58:30.913256+00	06e3a9cb-5613-4738-aa26-bf6bc68b2421
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	08d354a7-37c5-46bf-96d3-46f63981ff06	authenticated	authenticated	admin@kdadks.com	$2a$10$lgz8iKA4fgh9eQzR8pYIOeerBtED9VDO.hVJTrNLqjkmpLUoWd7Qy	2025-08-06 08:49:04.026874+00	\N		\N		\N			\N	2025-08-10 17:35:18.993703+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-06 08:49:04.008994+00	2025-08-13 09:16:15.357584+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	02371832-093b-4405-aa2a-4852269e535a	authenticated	authenticated	amit@nirchal.com	$2a$10$/cKweaFg8v08Dx3ocCU3keuMCd4kjt.zPEIBtHGG6OuZpvdovUkEe	2025-08-18 15:58:30.92376+00	\N		\N		\N			\N	2025-10-30 10:56:29.442556+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-08-18 15:58:30.906421+00	2025-10-30 10:56:29.469984+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 458, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict u3Kf0UMcRU71uxNALeywtGK0vquAEB0uUVbbCDOCZNifLKgVTfcKtsHAqXOtneZ

