import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Design tokens from globals.css (hardcoded for email — no CSS variables)
const C = {
  bg: "#EFEFE8",
  surface: "#FFFFFF",
  border: "#1C1917",
  text: "#1C1917",
  text2: "#3F3F46",
  text3: "#71717A",
  sidebar: "#17110D",
  red: "#E63946",
  green: "#3FAE2A",
};

interface LoginNotificationEmailProps {
  name: string;
  email: string;
}

export default function LoginNotificationEmail({
  name,
  email,
}: LoginNotificationEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Nuevo inicio de sesion en tu cuenta de Scoutia</Preview>
      <Body style={{ backgroundColor: C.bg, margin: 0, padding: "32px 16px", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container style={{ maxWidth: 520, margin: "0 auto" }}>

          {/* Pixel card */}
          <Section style={{
            border: `2px solid ${C.border}`,
            boxShadow: `4px 4px 0 ${C.border}`,
            backgroundColor: C.surface,
            overflow: "hidden",
          }}>

            {/* Header bar — matches the login form header style */}
            <Section style={{
              backgroundColor: C.sidebar,
              borderBottom: `2px solid ${C.border}`,
              padding: "10px 20px",
            }}>
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td>
                      <Text style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        color: "#A1A1AA",
                        textTransform: "uppercase",
                        margin: 0,
                        lineHeight: "1",
                      }}>
                        SCOUTIA
                      </Text>
                    </td>
                    <td align="right">
                      <span style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        backgroundColor: C.red,
                        border: "2px solid #3A2719",
                        marginRight: 4,
                      }} />
                      <span style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        border: "2px solid #3A2719",
                        marginRight: 4,
                      }} />
                      <span style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        backgroundColor: C.green,
                        border: "2px solid #3A2719",
                      }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Card body */}
            <Section style={{ padding: "28px 28px 24px" }}>

              {/* Pixel label */}
              <Text style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 9,
                letterSpacing: "0.12em",
                color: C.text3,
                textTransform: "uppercase",
                margin: "0 0 10px",
              }}>
                NOTIFICACION DE ACCESO
              </Text>

              <Heading
                as="h2"
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 16,
                  color: C.text,
                  margin: "0 0 20px",
                  lineHeight: "1.4",
                }}
              >
                Hola, {name}
              </Heading>

              {/* Inset block — like pixel-inset class */}
              <Section style={{
                backgroundColor: "#E7E7DE",
                border: `2px solid ${C.border}`,
                padding: "14px 16px",
                marginBottom: 20,
              }}>
                <Text style={{
                  fontSize: 13,
                  color: C.text,
                  margin: 0,
                  lineHeight: "1.6",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}>
                  Se ha iniciado sesion en tu cuenta de{" "}
                  <strong>Scoutia</strong> exitosamente.
                </Text>
              </Section>

              <Text style={{
                fontSize: 13,
                color: C.text2,
                margin: "0 0 20px",
                lineHeight: "1.6",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}>
                Si no reconoces esta actividad, cambia tu contrasena de inmediato
                desde{" "}
                <Link
                  href="https://scoutia.dev/configuracion"
                  style={{ color: C.text, textDecorationLine: "underline" }}
                >
                  Configuracion
                </Link>
                .
              </Text>

              <Hr style={{ borderTop: `2px solid ${C.border}`, margin: "20px 0 16px" }} />

              {/* Footer */}
              <table width="100%" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td>
                      <Text style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 8,
                        color: C.text3,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        margin: 0,
                      }}>
                        Este correo fue enviado a {email}
                      </Text>
                    </td>
                    <td align="right">
                      <Link
                        href="https://scoutia.dev"
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: 8,
                          color: C.text3,
                          textDecorationLine: "none",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        SCOUTIA.DEV
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

            </Section>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

LoginNotificationEmail.PreviewProps = {
  name: "Alejandro",
  email: "usuario@ejemplo.com",
} satisfies LoginNotificationEmailProps;
