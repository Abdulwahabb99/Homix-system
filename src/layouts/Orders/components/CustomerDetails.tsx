import { Home, Phone } from "@mui/icons-material";
import { Box, Card, CardContent, Link, Stack, Typography, useTheme, alpha } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const cardShell = (theme) => ({
  height: "100%",
  borderRadius: 2.5,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(99, 102, 241, 0.06)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const rowSx = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  p: 1.25,
  borderRadius: 1.5,
  bgcolor: alpha(theme.palette.primary.main, 0.04),
  border: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.6),
});

// eslint-disable-next-line react/prop-types
function CustomerDetails({ customerName, email, address, phoneNumber, shippedFromInventory }) {
  const theme = useTheme();

  if (shippedFromInventory) {
    return (
      <Card sx={cardShell(theme)}>
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LocalShippingIcon sx={{ color: "primary.main", fontSize: 23 }} />
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.primary"
            component="h3"
            sx={{ fontSize: "1.03rem" }}
          >
            بيانات الشحن
          </Typography>
        </Box>
        <CardContent sx={{ p: 2, flex: 1, "&:last-child": { pb: 2 } }}>
          <Stack spacing={1.5}>
            <Box sx={rowSx(theme)}>
              <Phone sx={{ fontSize: 23, color: "primary.main", flexShrink: 0 }} />
              <Box minWidth={0}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontSize: "0.77rem" }}
                >
                  هاتف
                </Typography>
                <Link
                  href="tel:01055047847"
                  underline="hover"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "primary.main",
                    display: "block",
                    textAlign: "start",
                  }}
                >
                  01055047847
                </Link>
              </Box>
            </Box>
            <Box sx={rowSx(theme)}>
              <Home sx={{ fontSize: 23, color: "primary.main", flexShrink: 0 }} />
              <Box minWidth={0}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ fontSize: "0.77rem" }}
                >
                  العنوان
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ lineHeight: 1.5, fontWeight: 500, fontSize: "0.88rem" }}
                >
                  المنصورية - الهرم - الطريق الرئيسي - زاوية أبو مسلم بجوار مسجد اهل التقوي
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardShell(theme)}>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          component="h3"
          sx={{ fontSize: "1.03rem" }}
        >
          العميل
        </Typography>
        {customerName ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.25 }}>
            <PersonIcon sx={{ color: "primary.main", fontSize: 23 }} />
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: "0.95rem" }}
            >
              {customerName}
            </Typography>
          </Box>
        ) : null}
      </Box>
      <CardContent sx={{ p: 2, flex: 1, "&:last-child": { pb: 2 } }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1.5, fontWeight: 600, fontSize: "0.77rem" }}
        >
          معلومات الاتصال
        </Typography>
        <Stack spacing={1.5}>
          <Box sx={rowSx(theme)}>
            <EmailIcon sx={{ fontSize: 23, color: "primary.main", flexShrink: 0 }} />
            <Box minWidth={0} flex={1}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.77rem" }}
              >
                البريد
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ wordBreak: "break-word", fontSize: "0.88rem" }}
              >
                {email}
              </Typography>
            </Box>
          </Box>
          <Box sx={rowSx(theme)}>
            <Home sx={{ fontSize: 23, color: "primary.main", flexShrink: 0 }} />
            <Box minWidth={0} flex={1}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.77rem" }}
              >
                العنوان
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: "0.88rem" }}
              >
                {address}
              </Typography>
            </Box>
          </Box>
          <Box sx={rowSx(theme)}>
            <Phone sx={{ fontSize: 23, color: "primary.main", flexShrink: 0 }} />
            <Box
              minWidth={0}
              flex={1}
              sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.77rem" }}
              >
                الجوال
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  width: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.primary"
                  component="span"
                  dir="ltr"
                  sx={{ m: 0, textAlign: "left", fontSize: "0.88rem" }}
                >
                  {phoneNumber ? phoneNumber : ""}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default CustomerDetails;
