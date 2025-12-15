export interface ValidatedParams {
  team: number;
  variant?: number;
  serial?: string;
  revealed?: boolean;
}

export function validateURLParams(searchParams: URLSearchParams): ValidatedParams | { error: string } {
  const teamParam = searchParams.get('team');

  // Team is required
  if (!teamParam) {
    return { error: 'Missing required parameter: team' };
  }

  const team = parseInt(teamParam, 10);

  // Validate team range
  if (isNaN(team) || team < 0 || team > 3) {
    return { error: `Invalid team parameter: ${teamParam} (must be 0-3)` };
  }

  // Handle variant parameter (Team 2 uses it)
  const variantParam = searchParams.get('variant');
  let variant: number | undefined;

  if (variantParam !== null) {
    variant = parseInt(variantParam, 10);
    if (isNaN(variant) || variant < 0 || variant > 3) {
      return { error: `Invalid variant parameter: ${variantParam} (must be 0-3)` };
    }
  }

  // Handle serial parameter (Teams 2 and 3 use it)
  const serial = searchParams.get('serial');

  // Validate serial for teams that require it
  if (team === 2 || team === 3) {
    if (!serial) {
      return { error: `Team ${team} requires serial parameter` };
    }

    if (!/^\d{6}$/.test(serial)) {
      return { error: `Invalid serial format: ${serial} (must be 6 digits)` };
    }
  }

  // Handle revealed parameter (optional, for testing)
  const revealedParam = searchParams.get('revealed');
  let revealed: boolean | undefined;

  if (revealedParam !== null) {
    revealed = revealedParam === 'true' || revealedParam === '1';
  }

  return {
    team,
    variant,
    serial: serial || undefined,
    revealed,
  };
}
